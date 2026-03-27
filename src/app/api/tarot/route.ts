import { NextRequest, NextResponse } from 'next/server'
import { drawRandomCard } from '@/lib/tarot'
import { generateTarotReading } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

function extractSection(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n[A-Z]+:|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const { deep, card: passedCard } = await req.json()
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

    const card = (passedCard && passedCard.name) ? passedCard : drawRandomCard()
    const raw = await generateTarotReading(card.name, card.isReversed, deep)

    await incrementUsage(email, ip, deep)

    if (deep) {
      const deepReading = {
        symbol: extractSection(raw, 'ENERGY'),
        timeline: {
          past: extractSection(raw, 'PAST'),
          present: extractSection(raw, 'PRESENT'),
          future: extractSection(raw, 'FUTURE'),
        },
        love: extractSection(raw, 'LOVE'),
        career: extractSection(raw, 'CAREER'),
        growth: extractSection(raw, 'GROWTH'),
        action: extractSection(raw, 'ACTION'),
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
