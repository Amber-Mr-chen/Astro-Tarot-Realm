import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { SIGN_KNOWLEDGE, extractString, computeCompatibility } from '@/lib/astrology'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const usage = await checkUsageLimit(email, ip)
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'limit_reached',
        plan: usage.plan,
        message: usage.plan === 'guest'
          ? 'Sign in to get free readings'
          : 'Daily limit reached. Upgrade to Pro for unlimited readings.',
      }, { status: 429 })
    }

    const { signA, signB } = await req.json()
    if (!signA || !signB || !SIGN_KNOWLEDGE[signA] || !SIGN_KNOWLEDGE[signB]) {
      return NextResponse.json({ error: 'Invalid signs provided' }, { status: 400 })
    }

    const isPro = usage.plan === 'pro'

    // Scores are always deterministic — computed from astrological rules, not AI
    const scores = computeCompatibility(signA, signB)

    const kA = SIGN_KNOWLEDGE[signA]
    const kB = SIGN_KNOWLEDGE[signB]

    // Build quality fallback reading (grounded in real astrology)
    const sameElement = kA.element === kB.element
    const elemRelation = sameElement
      ? `Both ${signA} and ${signB} share the ${kA.element} element`
      : `${signA}'s ${kA.element} and ${signB}'s ${kB.element} ${['Fire','Air'].includes(kA.element) && ['Fire','Air'].includes(kB.element) ? 'fuel each other naturally' : ['Earth','Water'].includes(kA.element) && ['Earth','Water'].includes(kB.element) ? 'nourish each other deeply' : 'create both friction and fascination'}`

    const fallbackReading: Record<string, string> = {
      overall: `${elemRelation}. ${signA}, ruled by ${kA.ruler}, brings ${kA.core?.split(',')[0]} into this pairing, while ${signB}, ruled by ${kB.ruler}, contributes ${kB.core?.split(',')[0]}. Together, this combination holds real potential when both parties are willing to meet the other honestly.`,
      strength: `The greatest strength here is the interplay of ${kA.element} and ${kB.element} energies. ${signA}'s gift of ${kA.gift?.split(' and ')[0]} complements ${signB}'s ${kB.gift?.split(' and ')[0]} in ways that can create something neither could build alone.`,
      challenge: `The tension in this pairing comes from ${kA.quality} ${signA} meeting ${kB.quality} ${signB}. ${kA.shadow?.charAt(0).toUpperCase() + kA.shadow?.slice(1)} on one side, ${kB.shadow} on the other — these are the fault lines to navigate with patience and honesty.`,
      love: `In love, ${signA} and ${signB} ${scores.love >= 80 ? 'can build something genuinely deep' : scores.love >= 65 ? 'find real connection with conscious effort' : 'face real challenges but not impossible ones'}. ${signA}'s emotional nature — ${kA.emotion?.split(',')[0]} — must learn to hold space for ${signB}'s ${kB.emotion?.split(',')[0]}.`,
      work: `As collaborators, ${signA} and ${signB} ${scores.work >= 80 ? 'are a formidable team' : scores.work >= 65 ? 'work well when roles are clearly defined' : 'need clear boundaries to avoid power struggles'}. ${kA.quality} ${signA} and ${kB.quality} ${signB} approach problems differently — which is either a strength or a source of friction depending on awareness.`,
      advice: `The key for this pairing is respecting what makes each sign fundamentally different rather than trying to change it. ${signA}, lean into your ${kA.core?.split(',')[0]} — it is your greatest offering. ${signB}, trust your ${kB.core?.split(',')[0]} — it is exactly what this relationship needs from you.`,
    }

    // AI-generated reading (fresh each request for natural variation)
    const ctx = await getCloudflareContext({ async: true })
    const ai = (ctx.env as any).AI
    let reading = { ...fallbackReading }

    if (ai) {
      const sections = isPro
        ? `"overall", "strength", "challenge", "love", "work", "advice"`
        : `"overall", "strength", "advice"`

      const prompt = `You are a relationship astrologer with 20 years of experience in synastry. You write with authority, warmth, and specificity. You never fabricate planetary positions. You speak from the signs' archetypal nature.

STRICT WRITING RULES:
- Write like a real person talking — not like AI generating content
- Vary sentence length — mix short punchy sentences with longer ones
- NEVER use: "must learn to", "they must", "in order to", "it is important", "Furthermore", "Moreover"
- NEVER start consecutive sentences the same way
- Be specific to ${signA} and ${signB}'s actual natures — not generic advice
- Each section: 3-4 sentences, 80-120 words minimum

Analyzing ${signA} × ${signB} compatibility:
- ${signA}: ${kA.element} sign, ${kA.quality} quality, ruled by ${kA.ruler}. Core: ${kA.core}. Emotional nature: ${kA.emotion}. Shadow: ${kA.shadow}. Gift: ${kA.gift}.
- ${signB}: ${kB.element} sign, ${kB.quality} quality, ruled by ${kB.ruler}. Core: ${kB.core}. Emotional nature: ${kB.emotion}. Shadow: ${kB.shadow}. Gift: ${kB.gift}.

Scores (do not contradict): Overall: ${scores.overall}%  Love: ${scores.love}%  Friendship: ${scores.friendship}%  Work: ${scores.work}%

CRITICAL: Output ONLY a valid JSON object. Every value is a plain string. No nested objects, no arrays, no markdown.
Example format: {"overall":"Virgo and Gemini share Mercury as their ruler...","strength":"What works here is the mental chemistry..."}

Output only these sections: ${sections}
JSON only, nothing else:`

      try {
        const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: isPro ? 1400 : 700,
          temperature: 0.75,
        })
        const raw = String(response?.response ?? '')
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')

        if (start !== -1 && end > start) {
          const parsed = JSON.parse(raw.slice(start, end + 1))
          const keys = isPro
            ? ['overall','strength','challenge','love','work','advice']
            : ['overall','strength','advice']

          for (const k of keys) {
            if (parsed[k] !== undefined) {
              const extracted = extractString(parsed[k])
              if (extracted.length > 30 && !extracted.startsWith('{') && !extracted.includes('"overall"')) {
                reading[k] = extracted
              }
            }
          }
        }
      } catch {
        // Keep fallback reading
      }
    }

    // For free users, only return 3 sections
    const freeReading = { overall: reading.overall, strength: reading.strength, advice: reading.advice }

    await incrementUsage(email, ip, false)
    return NextResponse.json({
      scores,
      reading: isPro ? reading : freeReading,
      plan: usage.plan,
      remaining: usage.remaining - 1,
    })
  } catch (e: any) {
    console.error('[compatibility] error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to generate reading', detail: e?.message }, { status: 500 })
  }
}
