import { NextRequest, NextResponse } from 'next/server'
import { generateHoroscope } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

const CACHE_VERSION = 'v5'
const cache = new Map<string, string>()

// Zodiac traits used in prompts for authentic readings
const SIGN_TRAITS: Record<string, { element: string; ruler: string; quality: string; traits: string }> = {
  Aries:       { element: 'Fire',  ruler: 'Mars',    quality: 'Cardinal', traits: 'bold, pioneering, energetic, impulsive' },
  Taurus:      { element: 'Earth', ruler: 'Venus',   quality: 'Fixed',    traits: 'patient, reliable, sensual, stubborn' },
  Gemini:      { element: 'Air',   ruler: 'Mercury', quality: 'Mutable',  traits: 'curious, adaptable, witty, restless' },
  Cancer:      { element: 'Water', ruler: 'Moon',    quality: 'Cardinal', traits: 'nurturing, intuitive, emotional, protective' },
  Leo:         { element: 'Fire',  ruler: 'Sun',     quality: 'Fixed',    traits: 'confident, creative, generous, dramatic' },
  Virgo:       { element: 'Earth', ruler: 'Mercury', quality: 'Mutable',  traits: 'analytical, precise, helpful, critical' },
  Libra:       { element: 'Air',   ruler: 'Venus',   quality: 'Cardinal', traits: 'diplomatic, fair, social, indecisive' },
  Scorpio:     { element: 'Water', ruler: 'Pluto',   quality: 'Fixed',    traits: 'intense, perceptive, secretive, transformative' },
  Sagittarius: { element: 'Fire',  ruler: 'Jupiter', quality: 'Mutable',  traits: 'optimistic, adventurous, philosophical, blunt' },
  Capricorn:   { element: 'Earth', ruler: 'Saturn',  quality: 'Cardinal', traits: 'disciplined, ambitious, patient, reserved' },
  Aquarius:    { element: 'Air',   ruler: 'Uranus',  quality: 'Fixed',    traits: 'innovative, independent, humanitarian, detached' },
  Pisces:      { element: 'Water', ruler: 'Neptune', quality: 'Mutable',  traits: 'empathetic, dreamy, artistic, escapist' },
}

// Lucky pools per element — deterministic selection by date hash
const LUCKY_POOLS: Record<string, { colors: string[]; numbers: number[]; times: string[] }> = {
  Fire:  { colors: ['Red', 'Orange', 'Gold', 'Crimson', 'Amber'],   numbers: [1,3,9],   times: ['Early morning', 'Noon', 'Sunset'] },
  Earth: { colors: ['Green', 'Brown', 'Olive', 'Tan', 'Forest'],    numbers: [2,4,8],   times: ['Morning', 'Late afternoon', 'Dusk'] },
  Air:   { colors: ['Yellow', 'Sky Blue', 'Lavender', 'White', 'Pale Gold'], numbers: [3,5,7], times: ['Morning', 'Midday', 'Early evening'] },
  Water: { colors: ['Teal', 'Silver', 'Indigo', 'Sea Green', 'Pearl'], numbers: [2,7,11], times: ['Dawn', 'Evening', 'Night'] },
}

function computeLucky(sign: string, date: string): { color: string; number: number; time: string } {
  const traits = SIGN_TRAITS[sign]
  if (!traits) return { color: 'Violet', number: 7, time: 'Evening' }
  const pool = LUCKY_POOLS[traits.element]

  // Hash date string to a stable number
  const hash = date.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)

  const color  = pool.colors [hash % pool.colors.length]
  const number = pool.numbers[(hash + sign.length) % pool.numbers.length]
  const time   = pool.times  [(hash + sign.charCodeAt(0)) % pool.times.length]

  return { color, number, time }
}

const deepFallback = (sign: string, date: string) => {
  const t = SIGN_TRAITS[sign] ?? { element: '', ruler: 'the stars', traits: 'unique' }
  return {
    energy: { text: `As a ${sign}, your ${t.element} energy is heightened today. ${t.ruler} is influencing your path, bringing a surge of ${t.traits.split(',')[0]} energy. Pay attention to the subtle cosmic shifts — they carry messages tailored specifically for you.`, stars: 4 },
    love:   { text: `Your ${t.element} nature makes you ${t.traits.split(',')[2]?.trim() ?? 'perceptive'} in love today. Whether you're single or partnered, meaningful connection is within reach. Be honest about what you truly want, and let your authentic ${sign} self lead the way forward.`, stars: 4 },
    career: { text: `${t.ruler} sharpens your instincts at work today. Trust your ${sign} judgment on professional matters. A focused, ${t.quality} effort now can lead to real, tangible progress — don't second-guess yourself when opportunities arise.`, stars: 3 },
    money:  { text: `Your ${t.element} sign benefits from careful deliberation with finances today. Review your budget before committing to anything new. ${sign}'s ${t.quality} quality helps you build stability through thoughtful, patient choices rather than impulsive moves.`, stars: 3 },
    advice: { text: `Set a clear intention that aligns with your ${sign} nature this morning. Your ${t.traits.split(',')[0]?.trim() ?? 'natural'} energy is your greatest asset today. Small, conscious actions compound into significant results — move forward with the quiet confidence only ${sign} can master.`, stars: 5 },
    lucky:  computeLucky(sign, date),
  }
}

const standardFallback = {
  love:   { text: 'The stars favor connection today. Open your heart.', stars: 3 },
  career: { text: 'Focus brings results. Trust your instincts.', stars: 3 },
  money:  { text: 'Be thoughtful with finances. Stability ahead.', stars: 3 },
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const { sign, deep } = await req.json()
    if (!sign) return NextResponse.json({ error: 'Sign is required' }, { status: 400 })

    const usage = await checkUsageLimit(email, ip)

    if (deep && usage.plan === 'pro' && (usage.deepRemaining ?? 0) <= 0) {
      return NextResponse.json({ error: 'deep_limit_reached', message: 'Daily deep reading limit reached (10/day for Pro)' }, { status: 429 })
    }
    if (!deep && !usage.allowed) {
      return NextResponse.json({
        error: 'limit_reached', plan: usage.plan,
        message: usage.plan === 'guest' ? 'Sign in to get 3 free readings per day' : 'Daily limit reached. Upgrade to Pro for unlimited readings',
      }, { status: 429 })
    }
    if (deep && usage.plan !== 'pro') {
      return NextResponse.json({ error: 'pro_required', message: 'Deep readings are exclusive to Pro members' }, { status: 403 })
    }

    const date = new Date().toISOString().split('T')[0]
    const cacheKey = `${CACHE_VERSION}-${sign}-${date}${deep ? '-deep' : ''}`

    // Cache hit — validate structure
    if (cache.has(cacheKey)) {
      const cached = JSON.parse(cache.get(cacheKey)!)
      const valid = deep
        ? (cached.love && cached.career && cached.money && cached.energy && cached.advice && cached.lucky)
        : (cached.love && cached.career && cached.money)
      if (valid) {
        await incrementUsage(email, ip, deep)
        return NextResponse.json({
          horoscope: cached, cached: true,
          remaining: usage.remaining - 1,
          deepRemaining: deep ? (usage.deepRemaining ?? 0) - 1 : usage.deepRemaining,
          plan: usage.plan, isDeep: deep,
        })
      }
      cache.delete(cacheKey)
    }

    // Compute lucky deterministically — never from AI
    const luckyToday = computeLucky(sign, date)
    const fb = deepFallback(sign, date)

    const raw = await generateHoroscope(sign, date, deep)
    const rawStr = String(raw)

    const start = rawStr.indexOf('{')
    const end = rawStr.lastIndexOf('}')
    let horoscopeData: any = deep ? fb : { ...standardFallback }

    if (start !== -1 && end !== -1 && end > start) {
      try {
        const parsed = JSON.parse(rawStr.slice(start, end + 1))
        if (deep) {
          horoscopeData = {
            energy: parsed.energy?.text?.length > 20 ? parsed.energy : fb.energy,
            love:   parsed.love?.text?.length   > 20 ? parsed.love   : fb.love,
            career: parsed.career?.text?.length > 20 ? parsed.career : fb.career,
            money:  parsed.money?.text?.length  > 20 ? parsed.money  : fb.money,
            advice: parsed.advice?.text?.length > 20 ? parsed.advice : fb.advice,
            // Always use deterministic lucky — never trust AI for this
            lucky: luckyToday,
          }
        } else {
          horoscopeData = {
            love:   parsed.love?.text?.length   > 5 ? parsed.love   : standardFallback.love,
            career: parsed.career?.text?.length > 5 ? parsed.career : standardFallback.career,
            money:  parsed.money?.text?.length  > 5 ? parsed.money  : standardFallback.money,
          }
        }
      } catch {
        // Keep fallback
      }
    }

    cache.set(cacheKey, JSON.stringify(horoscopeData))
    await incrementUsage(email, ip, deep)
    return NextResponse.json({
      horoscope: horoscopeData,
      remaining: usage.remaining - 1,
      deepRemaining: deep ? (usage.deepRemaining ?? 0) - 1 : usage.deepRemaining,
      plan: usage.plan, isDeep: deep,
    })
  } catch (e: any) {
    console.error('[horoscope] error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to generate horoscope', detail: e?.message ?? String(e) }, { status: 500 })
  }
}
