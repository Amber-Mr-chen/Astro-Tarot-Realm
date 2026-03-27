import { NextRequest, NextResponse } from 'next/server'
import { drawRandomCard } from '@/lib/tarot'
import { generateTarotReading } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const { deep } = await req.json()
    const usage = await checkUsageLimit(email, ip)

    // Check deep reading limit for Pro users
    if (deep && usage.plan === 'pro' && (usage.deepRemaining ?? 0) <= 0) {
      return NextResponse.json({
        error: 'deep_limit_reached',
        message: 'Daily deep reading limit reached (10/day for Pro)',
      }, { status: 429 })
    }

    // Check standard reading limit
    if (!deep && !usage.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        plan: usage.plan,
        message: usage.plan === 'guest'
          ? 'Sign in to get 3 free readings per day'
          : 'Daily limit reached. Upgrade to Pro for unlimited readings',
      }, { status: 429 })
    }

    // Only Pro users can request deep readings
    if (deep && usage.plan !== 'pro') {
      return NextResponse.json({
        error: 'pro_required',
        message: 'Deep readings are exclusive to Pro members',
      }, { status: 403 })
    }

    const card = drawRandomCard()
    const raw = await generateTarotReading(card.name, card.isReversed, deep)

    await incrementUsage(email, ip, deep)

    if (deep) {
      // Parse "|||" separated plain text sections
      const parts = raw.split('|||').map((s: string) => s.trim())
      const get = (i: number) => parts[i] || ''
      const deepReading = {
        symbol: get(0),
        timeline: { past: get(1), present: get(2), future: get(3) },
        love: get(4),
        career: get(5),
        growth: get(6),
        action: get(7),
        reflection: get(8)
      }
      return NextResponse.json({ 
        card, 
        reading: null,
        deepReading,
        remaining: usage.remaining - 1,
        deepRemaining: (usage.deepRemaining ?? 0) - 1,
        isDeep: true
      })
    }

    return NextResponse.json({ 
      card, 
      reading: raw, 
      remaining: usage.remaining - 1,
      deepRemaining: usage.deepRemaining,
      isDeep: false
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}
