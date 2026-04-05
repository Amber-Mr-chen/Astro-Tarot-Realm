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
    const apiKey = (ctx.env as any).SILICONFLOW_API_KEY
    let reading = { ...fallbackReading }

    const sfCall = async (prompt: string, maxTokens: number) => {
      if (!apiKey) return null
      try {
        const res = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'Qwen/Qwen2.5-7B-Instruct', messages: [{ role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.75 }),
        })
        const data = await res.json() as any
        return data.choices?.[0]?.message?.content ?? null
      } catch { return null }
    }

    if (apiKey) {
      const basePrompt = `You are a relationship astrologer with 20 years of experience in synastry. You write with authority, warmth, and specificity. You never fabricate planetary positions. You speak from the signs' archetypal nature.

STRICT WRITING RULES:
- Write like a real person talking — not like AI
- Vary sentence length — mix short punchy sentences with longer flowing ones
- NEVER use: "must learn to", "they must", "in order to", "it is important", "Furthermore", "Moreover"
- NEVER start consecutive sentences the same way
- Be specific to ${signA} and ${signB}'s actual natures — not generic advice
- Each section: 4-5 sentences, 100-150 words. Write rich, detailed content.

${signA} × ${signB} context:
- ${signA}: ${kA.element} sign, ${kA.quality} quality, ruled by ${kA.ruler}. Core: ${kA.core}. Emotional: ${kA.emotion}. Shadow: ${kA.shadow}. Gift: ${kA.gift}.
- ${signB}: ${kB.element} sign, ${kB.quality} quality, ruled by ${kB.ruler}. Core: ${kB.core}. Emotional: ${kB.emotion}. Shadow: ${kB.shadow}. Gift: ${kB.gift}.
Scores: Overall ${scores.overall}%  Love ${scores.love}%  Friendship ${scores.friendship}%  Work ${scores.work}%

CRITICAL: Output ONLY valid JSON. Every value is a plain string.`

      const parseAI = (raw: string, keys: string[]) => {
        try {
          const s = raw.indexOf('{'), e = raw.lastIndexOf('}')
          if (s === -1 || e <= s) return
          const parsed = JSON.parse(raw.slice(s, e + 1))
          for (const k of keys) {
            if (parsed[k]) {
              const v = extractString(parsed[k])
              if (v.length > 40 && !v.startsWith('{') && !v.includes('"overall"')) {
                reading[k] = v
              }
            }
          }
        } catch { /* keep fallback */ }
      }

      if (!isPro) {
        try {
          const raw = await sfCall(basePrompt + `\nOutput ONLY these 3 sections: {"overall":"...","strength":"...","advice":"..."}\nJSON only:`, 750)
          if (raw) parseAI(raw, ['overall', 'strength', 'advice'])
        } catch { /* keep fallback */ }
      } else {
        const [raw1, raw2] = await Promise.all([
          sfCall(basePrompt + `\nOutput ONLY these 3 sections:\n{"overall":"4-5 sentences on the overall energy and dynamic of this pairing","strength":"4-5 sentences on the greatest strength and what works best","advice":"4-5 sentences of specific astrological guidance for this pairing"}\nJSON only:`, 850),
          sfCall(basePrompt + `\nOutput ONLY these 3 sections:\n{"challenge":"4-5 sentences on the key friction points and challenges","love":"4-5 sentences on romantic and emotional compatibility","work":"4-5 sentences on professional and collaborative compatibility"}\nJSON only:`, 850),
        ])
        if (raw1) parseAI(raw1, ['overall', 'strength', 'advice'])
        if (raw2) parseAI(raw2, ['challenge', 'love', 'work'])
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
