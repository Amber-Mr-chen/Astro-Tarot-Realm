import { NextRequest, NextResponse } from 'next/server'
import { drawRandomCard } from '@/lib/tarot'
import { generateYesNoReading } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }
    const card = drawRandomCard()
    const reading = await generateYesNoReading(question, card.name, card.isReversed)
    return NextResponse.json({ card, reading, answer: card.isReversed ? 'No' : 'Yes' })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to generate reading' }, { status: 500 })
  }
}
