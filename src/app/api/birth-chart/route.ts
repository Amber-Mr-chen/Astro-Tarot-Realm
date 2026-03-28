import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'
import { getCloudflareContext } from '@opennextjs/cloudflare'

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
        message: usage.plan === 'guest' ? 'Sign in to get free readings' : 'Daily limit reached. Upgrade to Pro for unlimited readings.',
      }, { status: 429 })
    }

    const { sunSign, moonSign, risingSign, birthDate } = await req.json()
    if (!sunSign || !moonSign) {
      return NextResponse.json({ error: 'Missing sign data' }, { status: 400 })
    }

    const ctx = await getCloudflareContext({ async: true })
    const ai = (ctx.env as any).AI

    const risingLine = risingSign ? `Rising Sign: ${risingSign}` : 'Rising Sign: unknown (no birth time provided)'
    const isPro = usage.plan === 'pro'

    const prompt = `You are a master astrologer. Write a birth chart reading for someone born on ${birthDate}.
Sun Sign: ${sunSign} (core personality, ego, life force)
Moon Sign: ${moonSign} (emotions, instincts, inner self)
${risingLine} (outward manner, first impressions, physical appearance)

Write a deeply personal birth chart reading. Output ONLY valid JSON, no other text.
${isPro
  ? `Include all 6 sections with 3-4 sentences each: {"identity":"...","emotion":"...","rising":"...","purpose":"...","challenge":"...","advice":"..."}`
  : `Include 3 sections with 2-3 sentences each: {"identity":"...","emotion":"...","advice":"..."}`
}`

    let reading: Record<string, string> = {}

    if (ai) {
      const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: isPro ? 900 : 500,
        temperature: 0.7,
      })
      const raw = String(response?.response ?? '')
      const start = raw.indexOf('{')
      const end = raw.lastIndexOf('}')
      if (start !== -1 && end > start) {
        try { reading = JSON.parse(raw.slice(start, end + 1)) } catch { /* use fallback */ }
      }
    }

    // Fallback reading if AI fails
    if (!reading.identity) {
      reading.identity = `Your ${sunSign} Sun gives you a ${sunSign === 'Aries' ? 'bold and pioneering' : sunSign === 'Taurus' ? 'grounded and patient' : 'unique and powerful'} core nature. This is the essence of who you are at your heart.`
    }
    if (!reading.emotion) {
      reading.emotion = `Your ${moonSign} Moon shapes how you process feelings and connect emotionally. Your inner world is rich with ${moonSign}-influenced instincts that guide your most intimate responses.`
    }
    if (!reading.advice) {
      reading.advice = `Honor the interplay between your ${sunSign} Sun and ${moonSign} Moon. When these two energies align, you access your greatest personal power and clarity.`
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
