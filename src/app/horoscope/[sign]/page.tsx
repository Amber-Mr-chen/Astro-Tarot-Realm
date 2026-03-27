'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'

const SIGNS = {
  aries: { name: 'Aries', emoji: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  taurus: { name: 'Taurus', emoji: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  gemini: { name: 'Gemini', emoji: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  cancer: { name: 'Cancer', emoji: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  leo: { name: 'Leo', emoji: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  virgo: { name: 'Virgo', emoji: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  libra: { name: 'Libra', emoji: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  scorpio: { name: 'Scorpio', emoji: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  sagittarius: { name: 'Sagittarius', emoji: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  capricorn: { name: 'Capricorn', emoji: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  aquarius: { name: 'Aquarius', emoji: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  pisces: { name: 'Pisces', emoji: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' },
}

export default function SignPage() {
  const params = useParams()
  const sign = params.sign as string
  const signData = SIGNS[sign as keyof typeof SIGNS]
  const [reading, setReading] = useState('')
  const [loading, setLoading] = useState(false)

  if (!signData) {
    return <div className="min-h-screen flex items-center justify-center text-textMain">Sign not found</div>
  }

  const getReading = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign }),
      })
      const data = await res.json()
      setReading(data.reading)
    } catch {
      setReading('Failed to load reading. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">{signData.emoji}</div>
        <h1 className="font-cinzel text-4xl font-bold text-textMain mb-2">
          {signData.name} Daily Horoscope
        </h1>
        <p className="text-textSub">{signData.dates} · {signData.element} Sign</p>
      </div>

      {!reading ? (
        <div className="text-center">
          <button
            onClick={getReading}
            disabled={loading}
            className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            {loading ? 'Loading...' : 'Get Today\'s Reading'}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-6 leading-relaxed text-textSub whitespace-pre-line"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
          {reading}
        </div>
      )}

      <div className="mt-12 text-center">
        <a href="/horoscope" className="text-primary hover:underline">← Back to all signs</a>
      </div>
    </main>
  )
}
