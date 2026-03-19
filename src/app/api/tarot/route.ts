import { NextRequest, NextResponse } from 'next/server'
import { drawRandomCard } from '@/lib/tarot'
import { generateTarotReading } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const card = drawRandomCard()
    const reading = await generateTarotReading(card.name, card.isReversed)
    return NextResponse.json({ card, reading })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}
