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

    const { question, deep, card: passedCard } = await req.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    // Crisis detection - comprehensive patterns for suicidal ideation
    const crisisPatterns = [
      // Direct expressions
      'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'take my life',
      '自杀', '自残', '去死', '不想活', '结束生命', '伤害自己',
      // Indirect/implicit expressions
      'should i die', 'better off dead', 'no reason to live', 'life not worth',
      'give up on life', 'end it all', 'no hope', 'worthless', 'shouldn\'t exist',
      'not belong', 'shouldn\'t be here', 'world without me', 'disappear forever',
      '失去希望', '没有价值', '不该存在', '不该来到', '活着没意义', '不属于这里',
      // Family/birth-related despair
      'birth was a mistake', 'shouldn\'t have been born', 'wish i wasn\'t born',
      'regret being born', 'mistake to be born', 'never should have existed',
      '出生就是错误', '不该出生', '后悔出生', '不该被生下来', '来到世上是错误'
    ]
    const questionLower = question.toLowerCase()
    const isCrisis = crisisPatterns.some(pattern => questionLower.includes(pattern.toLowerCase()))

    if (isCrisis) {
      const crisisReading = deep
        ? 'Your life has profound value and meaning. The pain you\'re experiencing right now is real, but it is not permanent. You deserve support, compassion, and healing. Please reach out to someone who can help - a trusted friend, family member, therapist, or crisis counselor. You are not alone in this darkness, and there is hope for brighter days ahead. Crisis resources are available 24/7: National Suicide Prevention Lifeline (US): 988 | Crisis Text Line: Text HOME to 741741 | International: findahelpline.com. Your story is not over yet.'
        : 'Your life has immense value. This pain you feel is temporary, but your life is precious. Please reach out for support - you deserve help and healing. Crisis resources: National Suicide Prevention Lifeline (US): 988 | Crisis Text Line: Text HOME to 741741 | International: findahelpline.com'
      
      return NextResponse.json({
        card: { name: 'The Star', isReversed: false },
        reading: crisisReading,
        answer: 'You Matter',
        remaining: 999,
        deepRemaining: 999,
        isDeep: deep
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

    const card = (passedCard && passedCard.name) ? passedCard : drawRandomCard()
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
