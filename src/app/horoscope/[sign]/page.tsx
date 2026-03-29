'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import ReadingLoader from '../../reading-loader'
import { SIGN_STATIC } from '@/lib/astrology'

const SIGNS = {
  aries:       { name: 'Aries',       emoji: '🔥', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  taurus:      { name: 'Taurus',      emoji: '🌿', dates: 'Apr 20 - May 20', element: 'Earth' },
  gemini:      { name: 'Gemini',      emoji: '🌬️', dates: 'May 21 - Jun 20', element: 'Air' },
  cancer:      { name: 'Cancer',      emoji: '🌊', dates: 'Jun 21 - Jul 22', element: 'Water' },
  leo:         { name: 'Leo',         emoji: '☀️', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  virgo:       { name: 'Virgo',       emoji: '🌾', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  libra:       { name: 'Libra',       emoji: '⚖️', dates: 'Sep 23 - Oct 22', element: 'Air' },
  scorpio:     { name: 'Scorpio',     emoji: '🦂', dates: 'Oct 23 - Nov 21', element: 'Water' },
  sagittarius: { name: 'Sagittarius', emoji: '🏹', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  capricorn:   { name: 'Capricorn',   emoji: '🏔️', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  aquarius:    { name: 'Aquarius',    emoji: '⚡', dates: 'Jan 20 - Feb 18', element: 'Air' },
  pisces:      { name: 'Pisces',      emoji: '🐠', dates: 'Feb 19 - Mar 20', element: 'Water' },
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
  const staticData = SIGN_STATIC[signData?.name ?? '']
  const { data: session } = useSession()
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDeep, setIsDeep] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!signData || !staticData) {
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
        body: JSON.stringify({ sign: signData.name, deep }),
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

      {/* Hero */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">{signData.emoji}</div>
        <h1 className="font-cinzel text-4xl font-bold text-textMain mb-2">
          {signData.name} Daily Horoscope
        </h1>
        <p className="text-textSub">{signData.dates} · {signData.element} Sign · Ruled by {staticData.ruling}</p>
      </div>

      {/* Today's Reading CTA */}
      {!horoscope && !loading && (
        <div className="text-center space-y-4 mb-12">
          <button
            onClick={() => getReading(false)}
            className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:opacity-80 block mx-auto"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            ✨ Get Today's {signData.name} Reading
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

      {loading && <ReadingLoader type="horoscope" />}

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
        <div className="space-y-4 mb-12">
          {isDeep && (
            <div className="text-center mb-2">
              <span className="text-xs px-3 py-1 rounded-full text-gold"
                style={{ border: '1px solid rgba(243,156,18,0.4)', backgroundColor: 'rgba(243,156,18,0.1)' }}>
                ✨ Deep Reading
              </span>
            </div>
          )}

          {/* Standard 3 sections */}
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

          {/* Deep-only sections */}
          {isDeep && (horoscope as any).energy && (
            <div className="rounded-2xl p-6"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(243,156,18,0.3)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-textMain">⚡ Energy & Planetary Influence</h3>
                <Stars count={(horoscope as any).energy.stars} />
              </div>
              <p className="text-textSub leading-relaxed">{(horoscope as any).energy.text}</p>
            </div>
          )}
          {isDeep && (horoscope as any).advice && (
            <div className="rounded-2xl p-6"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-textMain">🌟 Daily Cosmic Advice</h3>
                <Stars count={(horoscope as any).advice.stars} />
              </div>
              <p className="text-textSub leading-relaxed">{(horoscope as any).advice.text}</p>
            </div>
          )}
          {isDeep && (horoscope as any).lucky && (
            <div className="rounded-2xl p-6 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(155,89,182,0.08))', border: '1px solid rgba(201,168,76,0.3)' }}>
              <h3 className="font-cinzel text-sm font-bold text-gold mb-4 uppercase tracking-wider">✦ Today's Lucky Elements</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-textSub mb-1">Color</p><p className="text-textMain font-semibold">{(horoscope as any).lucky.color}</p></div>
                <div><p className="text-xs text-textSub mb-1">Number</p><p className="text-textMain font-semibold">{(horoscope as any).lucky.number}</p></div>
                <div><p className="text-xs text-textSub mb-1">Time</p><p className="text-textMain font-semibold">{(horoscope as any).lucky.time}</p></div>
              </div>
            </div>
          )}

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

      {/* ── Static SEO Content ── */}

      {/* About this sign */}
      <section className="mb-10">
        <h2 className="font-cinzel text-2xl font-bold text-textMain mb-4">About {signData.name}</h2>
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
          <p className="text-textSub leading-relaxed mb-5">{staticData.about}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="font-semibold text-green-400 text-sm mb-2 uppercase tracking-wide">✓ Strengths</h3>
              <ul className="space-y-1">
                {staticData.strengths.map(s => (
                  <li key={s} className="text-textSub text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-orange-400 text-sm mb-2 uppercase tracking-wide">△ Challenges</h3>
              <ul className="space-y-1">
                {staticData.challenges.map(c => (
                  <li key={c} className="text-textSub text-sm flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(155,89,182,0.15)' }}>
            <h3 className="font-semibold text-gold text-sm mb-2 uppercase tracking-wide">💫 Most Compatible With</h3>
            <div className="flex gap-2 flex-wrap">
              {staticData.compatible.map(c => (
                <Link key={c} href={`/horoscope/${c.toLowerCase()}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="font-cinzel text-2xl font-bold text-textMain mb-4">{signData.name} FAQ</h2>
        <div className="space-y-3">
          {staticData.faq.map(({ q, a }) => (
            <div key={q} className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
              <h3 className="font-semibold text-textMain mb-2 text-sm">{q}</h3>
              <p className="text-textSub text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cross-links */}
      <section className="mb-10">
        <h2 className="font-cinzel text-xl font-bold text-textMain mb-4">Explore More</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/compatibility"
            className="rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
            <span className="text-2xl">💫</span>
            <div>
              <p className="font-semibold text-textMain text-sm">Zodiac Compatibility</p>
              <p className="text-textSub text-xs mt-1">See how {signData.name} pairs with every other sign in love, friendship, and work.</p>
            </div>
          </Link>
          <Link href="/birth-chart"
            className="rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
            <span className="text-2xl">🌌</span>
            <div>
              <p className="font-semibold text-textMain text-sm">Birth Chart Reading</p>
              <p className="text-textSub text-xs mt-1">Discover your Sun, Moon, and Rising signs for a complete cosmic portrait.</p>
            </div>
          </Link>
        </div>
      </section>

      <div className="text-center">
        <Link href="/horoscope" className="text-primary hover:underline text-sm">← Back to all signs</Link>
      </div>
    </main>
  )
}
