'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ZODIAC_SIGNS } from '@/lib/tarot'

type Horoscope = {
  love: { text: string; stars: number }
  career: { text: string; stars: number }
  money: { text: string; stars: number }
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-gold">
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

export default function HoroscopePage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [saved, setSaved] = useState(false)

  async function getHoroscope(sign: string) {
    setSelected(sign)
    setState('loading')
    setSaved(false)
    const res = await fetch('/api/horoscope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sign }),
    })
    const data = await res.json()
    setHoroscope(data.horoscope)
    setState('done')

    if (session?.user?.email) {
      const resultText = `Love: ${data.horoscope.love.stars}★ - ${data.horoscope.love.text}\n\nCareer: ${data.horoscope.career.stars}★ - ${data.horoscope.career.text}\n\nMoney: ${data.horoscope.money.stars}★ - ${data.horoscope.money.text}`
      await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          type: 'horoscope',
          question: sign,
          result: resultText
        })
      })
      setSaved(true)
    }
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Forecast ✦</div>
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Horoscope</h1>
        <p className="text-textSub max-w-md mx-auto">Select your zodiac sign to receive your personalized AI-powered daily forecast.</p>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-12">
        {ZODIAC_SIGNS.map((z) => (
          <button key={z.name} onClick={() => getHoroscope(z.name)}
            className="rounded-xl p-3 text-center transition-all hover:scale-105"
            style={{
              backgroundColor: selected === z.name ? '#9B59B6' : '#1A1A2E',
              border: `1px solid ${selected === z.name ? '#9B59B6' : 'rgba(155,89,182,0.3)'}`,
            }}>
            <div className="text-2xl mb-1">{z.emoji}</div>
            <div className="text-xs text-textSub font-cinzel">{z.name}</div>
          </button>
        ))}
      </div>

      {state === 'loading' && (
        <div className="text-center text-primary text-lg animate-pulse">Reading the stars for {selected}...</div>
      )}

      {state === 'done' && horoscope && (
        <div className="space-y-4">
          <h2 className="font-cinzel text-2xl text-center text-gold mb-6">
            {ZODIAC_SIGNS.find(z => z.name === selected)?.emoji} {selected} — Today's Reading
          </h2>
          {[
            { key: 'love', label: '💕 Love & Relationships', data: horoscope.love },
            { key: 'career', label: '💼 Career & Goals', data: horoscope.career },
            { key: 'money', label: '💰 Money & Finances', data: horoscope.money },
          ].map((section) => (
            <div key={section.key} className="rounded-2xl p-6"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-textMain">{section.label}</h3>
                <Stars count={section.data.stars} />
              </div>
              <p className="text-textSub leading-relaxed">{section.data.text}</p>
            </div>
          ))}
          {saved && <p className="text-green-400 text-sm text-center">✓ Reading saved to your history</p>}
          <button onClick={() => { setState('idle'); setSelected(null); setHoroscope(null); setSaved(false) }}
            className="w-full mt-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
            Check Another Sign
          </button>
        </div>
      )}
    </main>
  )
}
