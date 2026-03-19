import { NextRequest, NextResponse } from 'next/server'
import { generateHoroscope } from '@/lib/ai'

// Simple in-memory cache: sign+date -> result
const cache = new Map<string, string>()

export async function POST(req: NextRequest) {
  try {
    const { sign } = await req.json()
    if (!sign) return NextResponse.json({ error: 'Sign is required' }, { status: 400 })

    const date = new Date().toISOString().split('T')[0]
    const cacheKey = `${sign}-${date}`

    if (cache.has(cacheKey)) {
      return NextResponse.json({ horoscope: JSON.parse(cache.get(cacheKey)!), cached: true })
    }

    const raw = await generateHoroscope(sign, date)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response')

    cache.set(cacheKey, jsonMatch[0])
    return NextResponse.json({ horoscope: JSON.parse(jsonMatch[0]) })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate horoscope' }, { status: 500 })
  }
}
