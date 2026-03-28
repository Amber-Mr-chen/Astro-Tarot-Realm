import { NextRequest, NextResponse } from 'next/server'
import { generateHoroscope } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

// v2 = new 6-field deep format; bump version to bust cache
const CACHE_VERSION = 'v2'
const cache = new Map<string, string>()

const deepFallback = {
  energy: { text: "The cosmos are stirring with potent energy today. Pay attention to the subtle shifts happening around you — they carry important messages.", stars: 4 },
  love: { text: "Your heart is more open than usual today. Whether single or partnered, meaningful connection is possible. Be honest about what you truly want from relationships right now.", stars: 4 },
  career: { text: "Your instincts are sharp today. Trust your judgment on professional matters and don't second-guess yourself. A focused effort now can lead to real progress.", stars: 3 },
  money: { text: "Exercise patience with financial decisions today. Review your budget carefully before committing to anything new. Stability comes from thoughtful, deliberate choices.", stars: 3 },
  advice: { text: "Take time this morning to set a clear intention for the day. Small, conscious actions compound into significant results. Trust yourself and move forward with purpose.", stars: 5 },
  lucky: { color: "Gold", number: 7, time: "Morning" }
}

const standardFallback = {
  love: { text: "The stars favor connection today. Open your heart.", stars: 3 },
  career: { text: "Focus brings results. Trust your instincts.", stars: 3 },
  money: { text: "Be thoughtful with finances. Stability ahead.", stars: 3 }
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

    // Check cache — validate it has required fields for deep
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
          plan: usage.plan, isDeep: deep
        })
      }
      // Invalid cache — delete and regenerate
      cache.delete(cacheKey)
    }

    const raw = await generateHoroscope(sign, date, deep)
    const rawStr = String(raw)

    // Extract JSON — find the outermost { }
    const start = rawStr.indexOf('{')
    const end = rawStr.lastIndexOf('}')
    let horoscopeData: any = deep ? { ...deepFallback } : { ...standardFallback }

    if (start !== -1 && end !== -1 && end > start) {
      try {
        const parsed = JSON.parse(rawStr.slice(start, end + 1))
        if (deep) {
          // Merge parsed fields with fallback for any missing
          horoscopeData = {
            energy: parsed.energy?.text ? parsed.energy : deepFallback.energy,
            love: parsed.love?.text ? parsed.love : deepFallback.love,
            career: parsed.career?.text ? parsed.career : deepFallback.career,
            money: parsed.money?.text ? parsed.money : deepFallback.money,
            advice: parsed.advice?.text ? parsed.advice : deepFallback.advice,
            lucky: parsed.lucky?.color ? parsed.lucky : deepFallback.lucky,
          }
        } else {
          horoscopeData = {
            love: parsed.love?.text ? parsed.love : standardFallback.love,
            career: parsed.career?.text ? parsed.career : standardFallback.career,
            money: parsed.money?.text ? parsed.money : standardFallback.money,
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
      plan: usage.plan, isDeep: deep
    })
  } catch (e: any) {
    console.error('[horoscope] error:', e?.message ?? e)
    return NextResponse.json({ error: 'Failed to generate horoscope', detail: e?.message ?? String(e) }, { status: 500 })
  }
}
