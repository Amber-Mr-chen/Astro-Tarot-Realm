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
      let deepReading = null
      try {
        // Try to extract JSON from response - model sometimes wraps it in text
        const jsonMatch = raw.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          // Validate required fields exist
          if (parsed.symbol && parsed.timeline && parsed.love && parsed.career && parsed.growth && parsed.action && parsed.reflection) {
            deepReading = parsed
          }
        }
      } catch {
        deepReading = null
      }

      // If JSON parse failed, build a structured object from plain text
      if (!deepReading) {
        deepReading = {
          symbol: raw || 'The card speaks of transformation.',
          timeline: { past: 'Patterns from your past have shaped this moment.', present: 'Right now, this card calls for your attention.', future: 'Trust the path unfolding before you.' },
          love: 'Be open and honest in your connections.',
          career: 'Focus on what truly matters to your purpose.',
          growth: 'This is a time for inner reflection and growth.',
          action: 'Take one small step toward your intention today.',
          reflection: 'What is this card asking you to release?'
        }
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
