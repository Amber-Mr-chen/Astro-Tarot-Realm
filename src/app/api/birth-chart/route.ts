import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Real astrological knowledge base — prevents AI hallucination
const SIGN_KNOWLEDGE: Record<string, {
  element: string; quality: string; ruler: string
  core: string; emotion: string; shadow: string; gift: string
}> = {
  Aries:       { element: 'Fire',  quality: 'Cardinal', ruler: 'Mars',    core: 'courage, initiative, raw energy, and the drive to act first', emotion: 'quick to anger and quick to forgive, deeply passionate', shadow: 'impulsiveness and difficulty with patience', gift: 'natural leadership and the spark that starts things others only dream of' },
  Taurus:      { element: 'Earth', quality: 'Fixed',    ruler: 'Venus',   core: 'stability, sensuality, loyalty, and a deep connection to the physical world', emotion: 'slow to react but deeply feeling, holding emotions like bedrock', shadow: 'stubbornness and resistance to necessary change', gift: 'the rare ability to build lasting beauty and security that others can rely on' },
  Gemini:      { element: 'Air',   quality: 'Mutable',  ruler: 'Mercury', core: 'curiosity, adaptability, wit, and an insatiable hunger for connection and ideas', emotion: 'emotionally versatile, processing feelings through thought and conversation', shadow: 'restlessness and a tendency to stay on the surface', gift: 'the ability to see multiple sides of every truth and bridge worlds together' },
  Cancer:      { element: 'Water', quality: 'Cardinal', ruler: 'Moon',    core: 'deep nurturing, fierce emotional memory, intuition, and protection of those loved', emotion: 'emotions run as deep as the ocean — powerful, tidal, and transformative', shadow: 'emotional withdrawal and holding onto wounds longer than needed', gift: 'creating sanctuary and safety for others through unconditional emotional presence' },
  Leo:         { element: 'Fire',  quality: 'Fixed',    ruler: 'Sun',     core: 'creative power, generosity, dignity, and the authentic need to shine and be seen', emotion: 'warm-hearted and loyal to the core, hurt by betrayal and indifference', shadow: 'pride and the fear of not being enough', gift: 'inspiring others to believe in themselves through sheer radiant presence' },
  Virgo:       { element: 'Earth', quality: 'Mutable',  ruler: 'Mercury', core: 'discernment, service, precision, and the devotion to making things genuinely better', emotion: 'emotions channeled through analysis — feeling deeply but expressing carefully', shadow: 'self-criticism and anxiety when perfection is unachievable', gift: 'the ability to find the flaw that matters and the solution that heals' },
  Libra:       { element: 'Air',   quality: 'Cardinal', ruler: 'Venus',   core: 'harmony, fairness, aesthetic sense, and the instinct to build balanced relationships', emotion: 'deeply affected by disharmony, craving peace but capable of deep feeling', shadow: 'indecision and suppressing own needs to keep the peace', gift: 'creating beauty and equity in a world that desperately needs both' },
  Scorpio:     { element: 'Water', quality: 'Fixed',    ruler: 'Pluto',   core: 'depth, transformation, intensity, and the relentless pursuit of hidden truth', emotion: 'emotions are volcanic — contained beneath the surface until they cannot be', shadow: 'control, jealousy, and difficulty trusting others fully', gift: 'the power to transform completely — to die and be reborn stronger than before' },
  Sagittarius: { element: 'Fire',  quality: 'Mutable',  ruler: 'Jupiter', core: 'freedom, philosophy, expansion, and the unquenchable need to seek larger meaning', emotion: 'optimistic and emotionally buoyant, but chafes against restriction or smallness', shadow: 'overcommitment and bypassing difficult emotions with philosophical distance', gift: 'the vision to see beyond the horizon and inspire others to believe in possibility' },
  Capricorn:   { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn',  core: 'discipline, mastery, responsibility, and the patient building of something that endures', emotion: 'emotions held close and rarely shown — loyalty expressed through action, not words', shadow: 'excessive self-denial and equating worth with achievement', gift: 'the endurance to climb any mountain and the wisdom earned at the top' },
  Aquarius:    { element: 'Air',   quality: 'Fixed',    ruler: 'Uranus',  core: 'originality, humanitarian vision, independence, and thinking generations ahead', emotion: 'emotionally detached in private yet capable of fierce love for humanity as a whole', shadow: 'disconnection from personal intimacy in favor of abstract ideals', gift: 'the revolutionary mind that can see what the world has not yet imagined' },
  Pisces:      { element: 'Water', quality: 'Mutable',  ruler: 'Neptune', core: 'empathy, spiritual sensitivity, creativity, and the dissolving of boundaries between self and other', emotion: 'feels the emotions of everyone in the room — a gift and an overwhelming burden', shadow: 'escapism and difficulty separating self from others\' pain', gift: 'the boundless compassion that can touch what no logic can reach' },
}

// Extract a plain string from an AI value that might be an object or array
function extractString(val: unknown): string {
  if (typeof val === 'string') return val.trim()
  if (Array.isArray(val)) return val.map(extractString).filter(Boolean).join('. ')
  if (val && typeof val === 'object') {
    const obj = val as Record<string, unknown>
    // Try common description keys first
    for (const key of ['description', 'text', 'content', 'reading', 'summary']) {
      if (typeof obj[key] === 'string') return (obj[key] as string).trim()
    }
    // Fall back to first string value found
    for (const v of Object.values(obj)) {
      if (typeof v === 'string' && v.length > 10) return v.trim()
    }
  }
  return ''
}

// High-quality fallback readings grounded in real astrology
function buildFallback(sunSign: string, moonSign: string, risingSign: string | null, isPro: boolean): Record<string, string> {
  const sun = SIGN_KNOWLEDGE[sunSign]
  const moon = SIGN_KNOWLEDGE[moonSign]
  const rising = risingSign ? SIGN_KNOWLEDGE[risingSign] : null

  const reading: Record<string, string> = {
    identity: `Your ${sunSign} Sun is ruled by ${sun?.ruler ?? 'the cosmos'}, a ${sun?.element ?? ''} sign of ${sun?.quality ?? ''} quality. At your core, you carry ${sun?.core ?? `the full force of ${sunSign} energy`}. This is not a surface trait — it is the animating force behind your choices, your desires, and the life you are drawn to build.`,
    emotion: `Your ${moonSign} Moon shapes your entire inner emotional world. ${moonSign} ${moon?.quality ?? ''} energy means ${moon?.emotion ?? `you process feelings with ${moonSign} depth`}. Your shadow here involves ${moon?.shadow ?? 'the hidden challenges of your emotional nature'}, yet your true gift is ${moon?.gift ?? `the unique emotional intelligence ${moonSign} carries`}.`,
    advice: `The conversation between your ${sunSign} Sun and ${moonSign} Moon is the central story of your inner life. Where they align, you act with rare wholeness. Where they conflict, you find your deepest growth. Honor both — your ${sun?.core?.split(',')[0] ?? 'drive'} and your ${moon?.emotion?.split(',')[0] ?? 'feeling nature'} are not opposites. They are two voices of the same soul.`,
  }

  if (isPro) {
    reading.rising = rising
      ? `Your ${risingSign} Rising, ruled by ${rising.ruler}, is the face you show the world before anyone knows you. Others sense your ${rising.core?.split(',')[0] ?? risingSign + ' energy'} immediately. This is not a mask — it is the doorway through which your deeper self becomes visible when trust is earned.`
      : `Without a birth time, your Rising sign remains the one mystery in this chart. Your Rising sign governs your physical presence, your instinctive reactions, and the impression you leave on others within seconds. When you discover it, it will likely explain much about how you move through the world.`

    reading.purpose = `The combination of ${sunSign} Sun and ${moonSign} Moon points toward a life purpose rooted in ${sun?.gift?.split(' and ')[0] ?? 'your unique gifts'}. You are here to embody ${sun?.element ?? ''} energy in its most conscious form — not to perform it, but to live it fully. The world needs exactly the quality that feels most natural to you.`

    reading.challenge = `Your greatest growth edge lies precisely where your ${sunSign} nature meets its limits: ${sun?.shadow ?? 'the shadow side of your sign'}. Combined with the ${moonSign} Moon's tendency toward ${moon?.shadow ?? 'its own challenges'}, you will be asked repeatedly to choose depth over comfort. This is not a curse — it is the forge where your character is made.`
  }

  return reading
}

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

    const { sunSign, moonSign, risingSign, birthDate } = await req.json()
    if (!sunSign || !moonSign) {
      return NextResponse.json({ error: 'Missing sign data' }, { status: 400 })
    }

    const VALID_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
    if (!VALID_SIGNS.includes(sunSign) || !VALID_SIGNS.includes(moonSign) || (risingSign && !VALID_SIGNS.includes(risingSign))) {
      return NextResponse.json({ error: 'Invalid sign data' }, { status: 400 })
    }

    const isPro = usage.plan === 'pro'
    const sunK  = SIGN_KNOWLEDGE[sunSign]
    const moonK = SIGN_KNOWLEDGE[moonSign]
    const risingK = risingSign ? SIGN_KNOWLEDGE[risingSign] : null

    const ctx = await getCloudflareContext({ async: true })
    const apiKey = (ctx.env as any).SILICONFLOW_API_KEY

    let reading: Record<string, string> = buildFallback(sunSign, moonSign, risingSign, isPro)

    if (apiKey) {
      const risingBlock = risingSign && risingK
        ? `Rising Sign: ${risingSign} — ruled by ${risingK.ruler}, ${risingK.element} ${risingK.quality}. Core: ${risingK.core}.`
        : `Rising Sign: not provided (no birth time given)`

      const sections = isPro
        ? `"identity", "emotion", "rising", "purpose", "challenge", "advice"`
        : `"identity", "emotion", "advice"`

      const prompt = `You are a professional astrologer with 20 years of experience in both Hellenistic and psychological astrology. You speak with quiet authority — warm, direct, and grounded in traditional astrological knowledge. You never guess or fabricate. Every statement you make is rooted in established astrological tradition.

Birth chart for someone born on ${birthDate}:
- Sun Sign: ${sunSign} — ruled by ${sunK?.ruler}, ${sunK?.element} ${sunK?.quality}. Core traits: ${sunK?.core}. Shadow: ${sunK?.shadow}. Gift: ${sunK?.gift}.
- Moon Sign: ${moonSign} — ruled by ${moonK?.ruler}, ${moonK?.element} ${moonK?.quality}. Emotional nature: ${moonK?.emotion}. Shadow: ${moonK?.shadow}. Gift: ${moonK?.gift}.
- ${risingBlock}

Write a birth chart reading in the voice of an experienced astrologer speaking directly to this person. Use natural, flowing paragraphs — no bullet points, no lists. Speak with certainty. Avoid "possibly", "may", "might", "could be" — state what is true for this combination. Be warm but direct. Each section: 3 sentences minimum.

CRITICAL: Output ONLY a JSON object. Every value must be a plain string — no nested objects, no arrays. Example of correct format:
{"identity":"Your Pisces Sun makes you one of the most empathic people in any room. Neptune's rulership gives your entire life a quality of searching for what is real and sacred. You feel things others cannot name.","emotion":"Your Virgo Moon processes feeling through precision and service..."}

Output only these sections: ${sections}
JSON only, nothing else:`

      try {
        const sfRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'Qwen/Qwen2.5-72B-Instruct', messages: [{ role: 'user', content: prompt }], max_tokens: isPro ? 1000 : 550, temperature: 0.65 }),
        })
        const sfData = await sfRes.json() as any
        const raw = String(sfData.choices?.[0]?.message?.content ?? '')
        const start = raw.indexOf('{')
        const end = raw.lastIndexOf('}')

        if (start !== -1 && end > start) {
          const parsed = JSON.parse(raw.slice(start, end + 1))
          const keys = isPro
            ? ['identity','emotion','rising','purpose','challenge','advice']
            : ['identity','emotion','advice']

          for (const k of keys) {
            if (parsed[k] !== undefined) {
              const extracted = extractString(parsed[k])
              // Only use AI output if it's a real sentence (not placeholder or too short)
              if (extracted.length > 30 && !extracted.includes('"') && !extracted.startsWith('{')) {
                reading[k] = extracted
              }
            }
          }
        }
      } catch {
        // Keep fallback reading
      }
    }

    await incrementUsage(email, ip, false)
    return NextResponse.json({
      reading,
      plan: usage.plan,
      remaining: usage.remaining - 1,
    })
  } catch (e: any) {
    console.error('[birth-chart] error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to generate reading', detail: e?.message }, { status: 500 })
  }
}
