import { NextRequest, NextResponse } from 'next/server'
import { generateHoroscope } from '@/lib/ai'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

const cache = new Map<string, string>()

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const email = token?.email as string | null
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

    const { sign, deep } = await req.json()
    if (!sign) return NextResponse.json({ error: 'Sign is required' }, { status: 400 })

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

    const date = new Date().toISOString().split('T')[0]
    const cacheKey = `${sign}-${date}${deep ? '-deep' : ''}`

    if (cache.has(cacheKey)) {
      await incrementUsage(email, ip, deep)
      return NextResponse.json({
        horoscope: JSON.parse(cache.get(cacheKey)!),
        cached: true,
        remaining: usage.remaining - 1,
        deepRemaining: deep ? (usage.deepRemaining ?? 0) - 1 : usage.deepRemaining,
        plan: usage.plan,
        isDeep: deep
      })
    }

    const raw = await generateHoroscope(sign, date, deep)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response')

    cache.set(cacheKey, jsonMatch[0])
    await incrementUsage(email, ip, deep)
    return NextResponse.json({
      horoscope: JSON.parse(jsonMatch[0]),
      remaining: usage.remaining - 1,
      deepRemaining: deep ? (usage.deepRemaining ?? 0) - 1 : usage.deepRemaining,
      plan: usage.plan,
      isDeep: deep
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate horoscope' }, { status: 500 })
  }
}
