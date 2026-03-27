'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

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

type Horoscope = {
  love: { text: string; stars: number }
  career: { text: string; stars: number }
  money: { text: string; stars: number }
}

function Stars({ count }: { count: number }) {
  return <span className="text-gold">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

export default function SignPage() {
  const params = useParams()
  const sign = params.sign as string
  const signData = SIGNS[sign as keyof typeof SIGNS]
  const { data: session } = useSession()
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeep, setIsDeep] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!signData) {
    return <div className="min-h-screen flex items-center justify-center text-textMain">Sign not found</div>
  }

  const getReading = async (deep = false) => {
    setLoading(true)
    setError(null)
    setIsDeep(deep)
    try {
      const res = await fetch('/api/horoscope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sign, deep }),
      })
      const data = await res.json()

      if (res.status === 429 || res.status === 403) {
        setError(data.message)
        setLoading(false)
        return
      }

      if (data.horoscope) {
        setHoroscope(data.horoscope)
      } else {
        setError('Failed to load reading. Please try again.')
      }
    } catch {
      setError('Failed to load reading. Please try again.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">{signData.emoji}</div>
        <h1 className="font-cinzel text-4xl font-bold text-textMain mb-2">
          {signData.name} Daily Horoscope
        </h1>
        <p className="text-textSub">{signData.dates} · {signData.element} Sign</p>
      </div>

      {!horoscope && !loading && (
        <div className="text-center space-y-4">
          <button
            onClick={() => getReading(false)}
            className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:opacity-80 block mx-auto"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            Get Today's Reading
          </button>

          <div className="rounded-xl p-4 max-w-sm mx-auto"
            style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
            <p className="text-sm text-textSub mb-3">✨ <strong className="text-gold">Deep Reading</strong> — detailed planetary insights & actionable advice (Pro only)</p>
            {session ? (
              <button onClick={() => getReading(true)}
                className="w-full py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                ✨ Deep Reading (Pro)
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={() => signIn('google')}
                  className="w-full py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
                  Sign in to unlock
                </button>
                <Link href="/pricing" className="block text-center text-xs text-gold underline">
                  Already signed in? Upgrade to Pro →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-primary text-lg animate-pulse">
          {isDeep ? 'Channeling deeper cosmic energies...' : 'Reading the stars...'}
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-5 text-center mb-6"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <Link href="/pricing" className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
            Upgrade to Pro →
          </Link>
        </div>
      )}

      {horoscope && (
        <div className="space-y-4">
          {isDeep && (
            <div className="text-center mb-2">
              <span className="text-xs px-3 py-1 rounded-full text-gold"
                style={{ border: '1px solid rgba(243,156,18,0.4)', backgroundColor: 'rgba(243,156,18,0.1)' }}>
                ✨ Deep Reading
              </span>
            </div>
          )}
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

          {/* After reading - upsell */}
          {!isDeep && (
            <div className="rounded-xl p-4 text-center mt-4"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <p className="text-sm text-textSub mb-2">Want deeper insights with planetary influences?</p>
              {session ? (
                <button onClick={() => getReading(true)}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  ✨ Try Deep Reading (Pro)
                </button>
              ) : (
                <Link href="/pricing" className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  Upgrade to Pro →
                </Link>
              )}
            </div>
          )}

          <button onClick={() => { setHoroscope(null); setError(null) }}
            className="w-full py-3 rounded-full text-sm font-semibold text-white mt-2"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            Get New Reading
          </button>
        </div>
      )}

      <div className="mt-12 text-center">
        <a href="/horoscope" className="text-primary hover:underline">← Back to all signs</a>
      </div>
    </main>
  )
}
