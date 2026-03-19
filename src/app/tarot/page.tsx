'use client'
import { useState } from 'react'

export default function TarotPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<{ card: { name: string; isReversed: boolean }; reading: string } | null>(null)

  async function drawCard() {
    setState('loading')
    const res = await fetch('/api/tarot', { method: 'POST' })
    const data = await res.json()
    setResult(data)
    setState('done')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Reading ✦</div>
      <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Tarot</h1>
      <p className="text-textSub mb-12 max-w-md">Focus your mind, take a breath, and draw your card for today.</p>

      {state === 'idle' && (
        <div className="flex gap-6 mb-8">
          {[0, 1, 2].map((i) => (
            <button key={i} onClick={drawCard}
              className="tarot-card w-24 h-40 md:w-32 md:h-52 rounded-xl cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D1B69)', border: '2px solid #9B59B6' }}>
              <div className="w-full h-full flex items-center justify-center text-4xl">✦</div>
            </button>
          ))}
        </div>
      )}

      {state === 'loading' && (
        <div className="text-primary text-lg animate-pulse mb-8">The cards are speaking...</div>
      )}

      {state === 'done' && result && (
        <div className="max-w-lg w-full rounded-2xl p-8 text-left"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}>
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🃏</div>
            <h2 className="font-cinzel text-2xl font-bold text-gold">{result.card.name}</h2>
            <span className="text-textSub text-sm">{result.card.isReversed ? '(Reversed)' : '(Upright)'}</span>
          </div>
          <p className="text-textMain leading-relaxed whitespace-pre-line">{result.reading}</p>
          <button onClick={() => { setState('idle'); setResult(null) }}
            className="mt-6 w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
            Draw Another Card
          </button>
        </div>
      )}
    </main>
  )
}
