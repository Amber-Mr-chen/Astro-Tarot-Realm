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

    // Comprehensive crisis detection - covers direct and implicit suicidal ideation
    const crisisPatterns = [
      // 1. Direct suicidal intent
      'suicide', 'kill myself', 'end my life', 'self harm', 'hurt myself', 'take my life',
      'commit suicide', 'suicidal', 'end myself',
      '自杀', '自残', '去死', '不想活', '结束生命', '伤害自己', '自我了断',
      
      // 2. Self-worth negation
      'worthless', 'no value', 'burden to', 'waste of space', 'useless person',
      'nobody cares', 'better off without me', 'don\'t deserve',
      '没有价值', '是个负担', '没用的人', '没人在乎', '不配活着',
      
      // 3. Existence negation
      'shouldn\'t exist', 'shouldn\'t be alive', 'mistake to be born', 'wish i wasn\'t born',
      'shouldn\'t have been born', 'regret being born', 'never should have existed',
      'shouldn\'t have come', 'shouldn\'t be in this world',
      '不该存在', '不该活着', '出生就是错误', '不该出生', '后悔出生', '不该被生下来',
      '不该来到', '不该来到这个世上', '不该来到世上', '不该来这个世界',
      
      // 4. Despair expressions
      'no hope', 'give up on life', 'can\'t go on', 'no point in living',
      'life not worth', 'nothing to live for', 'no reason to continue', 'lost hope',
      '失去希望', '失去了希望', '放弃生命', '活不下去', '活着没意义', '没有理由继续',
      
      // 5. Disappearance wishes
      'disappear forever', 'cease to exist', 'fade away', 'be gone', 'vanish',
      'stop existing', 'no longer be here',
      '永远消失', '不复存在', '消失不见', '不在这里',
      
      // 6. Family trauma / rejection
      'unloved', 'unwanted', 'rejected by', 'abandoned', 'nobody wants me',
      'parents don\'t love', 'family hates me', 'not loved',
      '不被爱', '不被需要', '被抛弃', '没人要我', '父母不爱我', '家人讨厌我',
      
      // 7. Pain escape
      'escape the pain', 'make it stop', 'end the suffering', 'stop hurting',
      'can\'t take it anymore', 'too much pain',
      '逃离痛苦', '让痛苦停止', '结束痛苦', '承受不了', '太痛苦了',
      
      // 8. Comparative despair
      'better off dead', 'world better without me', 'everyone better if i',
      'should i just die', 'easier if i wasn\'t here',
      '死了更好', '世界没有我更好', '我死了大家更好', '是不是该死',
      
      // 9. Exhaustion / giving up
      'too tired to live', 'can\'t do this anymore', 'done with life',
      'exhausted from living', 'no energy to continue',
      '活着太累', '做不下去了', '厌倦生活', '没力气继续',
      
      // 10. Implicit help-seeking
      'is there a way out', 'how to stop feeling', 'make the thoughts stop',
      'end this pain', 'way to not wake up',
      '有没有出路', '怎么停止这种感觉', '让想法停止', '不想醒来'
    ]
    const questionLower = question.toLowerCase()
    const hasKeyword = crisisPatterns.some(pattern => questionLower.includes(pattern.toLowerCase()))

    // If keyword detected, immediately return crisis response
    if (hasKeyword) {
      const hopeCards = [
        { name: 'The Star', meaning: 'hope and healing' },
        { name: 'The Sun', meaning: 'life force and warmth' },
        { name: 'The World', meaning: 'wholeness and belonging' },
        { name: 'Strength', meaning: 'inner courage' },
        { name: 'Temperance', meaning: 'balance and recovery' }
      ]
      // Use question hash to consistently select same card for same question
      const hash = question.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const selectedCard = hopeCards[hash % hopeCards.length]
      
      const crisisReading = deep
        ? `**I See You**\n\nYour pain is real, and I'm not going to minimize it. Right now might feel like drowning, but you're still here. That takes courage, even if it doesn't feel like it.\n\n**Your Worth Isn't Conditional**\n\nFamily can wound us in ways that cut deep. When love feels unequal or absent, it's easy to believe we're the problem. But here's the truth: your value doesn't come from how others treat you. You matter because you exist, period. Not because of what you do, achieve, or earn. Just because you're here.\n\n**Three Things You Can Do Right Now**\n\n1) Text or call one person - doesn't have to be deep, just "hey, I'm having a rough day" counts\n2) Do something small and kind for yourself - step outside, drink water, put on a song you love\n3) Talk to someone trained to help - they've heard it all, and they won't judge you\n\n**Help Is Real**\n\nNational Suicide Prevention Lifeline (US): 988\nCrisis Text Line: Text HOME to 741741\nInternational: findahelpline.com\n\nThese aren't just numbers. Real people answer. They care.\n\n**This Isn't Forever**\n\nWhat you're feeling right now - this specific intensity of pain - it shifts. Not instantly, but it does. Healing isn't linear, but it's possible. A year from now, you might look back and be so glad you stayed. Your story isn't over. You deserve to see what comes next.`
        : `Your life has immense value. This pain you feel is temporary, but your life is precious. Please reach out for support - you deserve help and healing. Crisis resources: National Suicide Prevention Lifeline (US): 988 | Crisis Text Line: Text HOME to 741741 | International: findahelpline.com`
      
      return NextResponse.json({
        card: { name: selectedCard.name, isReversed: false },
        reading: crisisReading,
        answer: 'You Matter',
        remaining: 999,
        deepRemaining: 999,
        isDeep: deep
      }, { status: 200 })
    }

    // AI semantic analysis ONLY if keyword check passed (as safety net)
    if (!hasKeyword) {
      const ctx = await import('@opennextjs/cloudflare').then(m => m.getCloudflareContext({ async: true }))
      const ai = (ctx.env as any).AI
      if (ai) {
        try {
          const semanticCheck = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
            messages: [{
              role: 'user',
              content: `Analyze ONLY for severe suicidal ideation or self-harm intent. Ignore casual questions about daily activities. Reply ONLY "CRISIS" if the person expresses desire to die, self-harm, or believes they shouldn't exist. Reply "SAFE" for everything else. Question: "${question}"`
            }],
            max_tokens: 5
          })
          if (semanticCheck.response?.toUpperCase().includes('CRISIS')) {
          const hopeCards = [
            { name: 'The Star', meaning: 'hope and healing' },
            { name: 'The Sun', meaning: 'life force and warmth' },
            { name: 'The World', meaning: 'wholeness and belonging' },
            { name: 'Strength', meaning: 'inner courage' },
            { name: 'Temperance', meaning: 'balance and recovery' }
          ]
          const selectedCard = hopeCards[Math.floor(Math.random() * hopeCards.length)]
          
          const crisisReading = deep
            ? `**I See You**\n\nYour pain is real, and I'm not going to minimize it. Right now might feel like drowning, but you're still here. That takes courage, even if it doesn't feel like it.\n\n**Your Worth Isn't Conditional**\n\nFamily can wound us in ways that cut deep. When love feels unequal or absent, it's easy to believe we're the problem. But here's the truth: your value doesn't come from how others treat you. You matter because you exist, period. Not because of what you do, achieve, or earn. Just because you're here.\n\n**Three Things You Can Do Right Now**\n\n1) Text or call one person - doesn't have to be deep, just "hey, I'm having a rough day" counts\n2) Do something small and kind for yourself - step outside, drink water, put on a song you love\n3) Talk to someone trained to help - they've heard it all, and they won't judge you\n\n**Help Is Real**\n\nNational Suicide Prevention Lifeline (US): 988\nCrisis Text Line: Text HOME to 741741\nInternational: findahelpline.com\n\nThese aren't just numbers. Real people answer. They care.\n\n**This Isn't Forever**\n\nWhat you're feeling right now - this specific intensity of pain - it shifts. Not instantly, but it does. Healing isn't linear, but it's possible. A year from now, you might look back and be so glad you stayed. Your story isn't over. You deserve to see what comes next.`
            : `Your life has immense value. This pain you feel is temporary, but your life is precious. Please reach out for support - you deserve help and healing. Crisis resources: National Suicide Prevention Lifeline (US): 988 | Crisis Text Line: Text HOME to 741741 | International: findahelpline.com`
          
          return NextResponse.json({
            card: { name: selectedCard.name, isReversed: false },
            reading: crisisReading,
            answer: 'You Matter',
            remaining: 999,
            deepRemaining: 999,
            isDeep: deep
          }, { status: 200 })
          }
        } catch {
          // If AI check fails, continue with normal flow
        }
      }
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
