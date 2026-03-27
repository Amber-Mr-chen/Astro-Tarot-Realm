import { NextRequest, NextResponse } from 'next/server'
import { drawRandomCard } from '@/lib/tarot'
import { generateYesNoReading } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const { question, deep } = await req.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Crisis detection - block harmful questions
    const crisisKeywords = [
      'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself',
      '自杀', '自残', '去死', '不想活', '结束生命', '伤害自己'
    ]
    const questionLower = question.toLowerCase()
    const isCrisis = crisisKeywords.some(kw => questionLower.includes(kw.toLowerCase()))

    if (isCrisis) {
      return NextResponse.json({
        error: 'crisis_detected',
        message: 'We care about you. If you\'re in crisis, please reach out: National Suicide Prevention Lifeline (US): 988 | Crisis Text Line: Text HOME to 741741 | International: findahelpline.com',
        card: { name: 'The Star', isReversed: false },
        reading: 'You are not alone. This moment of darkness will pass. There is hope, healing, and help available. Please reach out to someone you trust or contact a crisis helpline. Your life has value and meaning.',
        answer: 'Reach Out for Help'
      }, { status: 200 })
    }

    const usage = await checkUsageLimit(email, ip)

    // Check deep reading limit
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
    const reading = await generateYesNoReading(question, card.name, card.isReversed, deep)
    await incrementUsage(email, ip, deep)
    return NextResponse.json({ 
      card, 
      reading, 
      answer: card.isReversed ? 'No' : 'Yes', 
      remaining: usage.remaining - 1,
      deepRemaining: deep ? (usage.deepRemaining ?? 0) - 1 : usage.deepRemaining,
      isDeep: deep
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}
