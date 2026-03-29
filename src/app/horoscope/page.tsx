'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { ZODIAC_SIGNS } from '@/lib/tarot'
import Link from 'next/link'
import ShareButton from '../share-button'

type Horoscope = {
  love: { text: string; stars: number }
  career: { text: string; stars: number }
  money: { text: string; stars: number }
  // Deep reading extras
  energy?: { text: string; stars: number }
  advice?: { text: string; stars: number }
  lucky?: { color: string; number: number; time: string }
}

function Stars({ count }: { count: number }) {
  return <span className="text-gold">{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

export default function HoroscopePage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [horoscope, setHoroscope] = useState<Horoscope | null>(null)
  const [isDeep, setIsDeep] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)
  const [deepRemaining, setDeepRemaining] = useState<number | null>(null)
  const [deepLoading, setDeepLoading] = useState(false)
  // plan comes from API response after first reading
  const [userPlan, setUserPlan] = useState<string | null>(null)

  const isPro = userPlan === 'pro'

  async function getHoroscope(sign: string, deep = false) {
    setSelected(sign)
    setError(null)

    if (deep) {
      setDeepLoading(true)
    } else {
      setState('loading')
      setSaved(false)
      setIsDeep(false)
    }

    const res = await fetch('/api/horoscope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sign, deep }),
    })
    const data = await res.json()

    if (deep) setDeepLoading(false)

    if (res.status === 429 || res.status === 403) {
      setError(data.message)
      if (!deep) setState('idle')
      return
    }

    if (res.status === 500 || !data.horoscope) {
      setError(`Error: ${data.detail || data.error || 'Something went wrong. Please try again.'}`)
      if (!deep) setState('idle')
      return
    }

    setHoroscope(data.horoscope)
    setRemaining(data.remaining ?? null)
    if (typeof data.deepRemaining === 'number') setDeepRemaining(data.deepRemaining)
    if (data.plan) setUserPlan(data.plan)
    setIsDeep(deep)
    setState('done')

    if (session?.user?.email) {
      const h = data.horoscope
      const resultText = `Love: ${h.love.stars}★ - ${h.love.text}\n\nCareer: ${h.career.stars}★ - ${h.career.text}\n\nMoney: ${h.money.stars}★ - ${h.money.text}`
      fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, type: 'horoscope', question: sign, result: resultText })
      }).then(() => setSaved(true))
    }
  }

  const selectedSign = ZODIAC_SIGNS.find(z => z.name === selected)

  // Deep reading button content
  function DeepReadingSection() {
    if (!session) {
      return (
        <button onClick={() => signIn('google')}
          className="px-6 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
          Sign In to Continue
        </button>
      )
    }

    // userPlan is null before first reading — show upgrade prompt for non-pro hint
    if (userPlan === null || !isPro) {
      return (
        <Link href="/pricing"
          className="inline-block px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
          Upgrade to Pro →
        </Link>
      )
    }

    // Pro user
    if (deepRemaining !== null && deepRemaining <= 0) {
      return <p className="text-textSub text-sm">You&apos;ve used all 10 deep readings today. Come back tomorrow!</p>
    }

    return (
      <div>
        <button
          onClick={() => { if (selected) getHoroscope(selected, true) }}
          disabled={deepLoading}
          className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
          {deepLoading ? 'Reading the stars...' : `✨ Get Deep Reading for ${selected}`}
        </button>
        {deepRemaining !== null && deepRemaining > 0 && (
          <p className="text-textSub text-xs mt-2">{deepRemaining} deep readings remaining today</p>
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Forecast ✦</div>
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Horoscope</h1>
        <p className="text-textSub max-w-md mx-auto">Select your zodiac sign for your personalized daily forecast.</p>
      </div>

      {/* Banner */}
      {!session ? (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)' }}>
          ✨ <button onClick={() => signIn('google')} className="text-gold underline">Sign in</button> for 3 free readings/day · <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> for unlimited + deep readings
        </div>
      ) : (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2)' }}>
          🌟 Want deeper insights? <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> to unlock Deep Readings (10/day)
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <div className="text-red-400 font-semibold mb-2">Limit Reached</div>
          <p className="text-textSub text-sm mb-4">{error}</p>
          {!session ? (
            <button onClick={() => signIn('google')}
              className="px-6 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
              Sign In for 3 Free Readings
            </button>
          ) : (
            <Link href="/pricing"
              className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-center text-white"
              style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
              Upgrade to Pro →
            </Link>
          )}
        </div>
      )}

      {/* Zodiac grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {ZODIAC_SIGNS.map((z) => {
          const isSelected = selected === z.name
          return (
            <button key={z.name} onClick={() => getHoroscope(z.name, false)}
              className="rounded-2xl p-5 text-center transition-all hover:scale-105 relative overflow-hidden"
              style={{
                backgroundColor: isSelected ? z.color + 'cc' : z.bg,
                border: `2px solid ${isSelected ? z.color : z.color + '66'}`,
                boxShadow: isSelected ? `0 0 24px ${z.color}88` : `0 2px 12px ${z.color}22`,
              }}>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                style={{ fontSize: '5rem', opacity: 0.07, color: z.color }}>
                {z.symbol}
              </div>
              <div className="text-4xl mb-2 relative z-10">{z.emoji}</div>
              <div className="font-cinzel font-bold text-sm relative z-10"
                style={{ color: isSelected ? '#fff' : z.color }}>
                {z.name}
              </div>
              <div className="text-lg relative z-10 mt-1"
                style={{ color: isSelected ? 'rgba(255,255,255,0.7)' : z.color + 'aa' }}>
                {z.symbol}
              </div>
              <div className="text-xs mt-1 relative z-10"
                style={{ color: isSelected ? 'rgba(255,255,255,0.6)' : z.color + '88' }}>
                {z.dates}
              </div>
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div className="text-center text-primary text-lg animate-pulse py-8">
          Reading the stars for {selected}...
        </div>
      )}

      {/* Results */}
      {state === 'done' && horoscope && (
        <div className="space-y-4">
          <h2 className="font-cinzel text-2xl text-center mb-6"
            style={{ color: selectedSign?.color ?? '#F39C12' }}>
            {selectedSign?.emoji} {selected} — Today&apos;s Reading
            {isDeep && <span className="text-xs ml-2 text-gold">✨ Deep</span>}
          </h2>

          {/* Energy banner — deep reading only */}
          {isDeep && horoscope.energy && (
            <div className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.2), rgba(243,156,18,0.15))', border: '1px solid rgba(243,156,18,0.4)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gold">⚡ Today&apos;s Energy</h3>
                <Stars count={horoscope.energy.stars} />
              </div>
              <p className="text-textMain leading-relaxed">{horoscope.energy.text}</p>
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

          {/* Advice — deep reading only */}
          {isDeep && horoscope.advice && (
            <div className="rounded-2xl p-6"
              style={{ background: 'linear-gradient(135deg, rgba(39,174,96,0.1), rgba(93,173,226,0.1))', border: '1px solid rgba(39,174,96,0.4)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: '#2ECC71' }}>🌟 Today&apos;s Guidance</h3>
                <Stars count={horoscope.advice.stars} />
              </div>
              <p className="text-textMain leading-relaxed">{horoscope.advice.text}</p>
            </div>
          )}

          {/* Lucky — deep reading only */}
          {isDeep && horoscope.lucky && (
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(243,156,18,0.3)' }}>
              <h3 className="font-semibold text-gold mb-4">🍀 Lucky Elements Today</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(155,89,182,0.1)' }}>
                  <div className="text-2xl mb-1">🎨</div>
                  <div className="text-xs text-textSub mb-1">Color</div>
                  <div className="text-sm font-semibold text-textMain">{horoscope.lucky.color}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(155,89,182,0.1)' }}>
                  <div className="text-2xl mb-1">🔢</div>
                  <div className="text-xs text-textSub mb-1">Number</div>
                  <div className="text-sm font-semibold text-textMain">{horoscope.lucky.number}</div>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(155,89,182,0.1)' }}>
                  <div className="text-2xl mb-1">⏰</div>
                  <div className="text-xs text-textSub mb-1">Best Time</div>
                  <div className="text-sm font-semibold text-textMain">{horoscope.lucky.time}</div>
                </div>
              </div>
            </div>
          )}

          {saved && <p className="text-green-400 text-sm text-center">✓ Reading saved to your history</p>}

          {/* Share */}
          {selected && horoscope && (
            <div className="flex justify-center">
              <ShareButton text={`My ${selected.charAt(0).toUpperCase() + selected.slice(1)} horoscope today on TarotRealm ⭐\n\nLove ${'★'.repeat(horoscope.love.stars)}${'☆'.repeat(5-horoscope.love.stars)} · Career ${'★'.repeat(horoscope.career.stars)}${'☆'.repeat(5-horoscope.career.stars)} · Money ${'★'.repeat(horoscope.money.stars)}${'☆'.repeat(5-horoscope.money.stars)}\n\nGet yours free → tarotrealm.xyz/horoscope`} />
            </div>
          )}

          {/* Deep Reading upsell */}
          {!isDeep && (
            <div className="rounded-2xl p-6 text-center mt-4"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.08), rgba(155,89,182,0.08))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <div className="text-gold font-cinzel text-lg mb-2">✨ Unlock Your Deep Reading</div>
              <p className="text-textSub text-sm mb-4">
                Detailed planetary insights, deeper love &amp; career analysis — exclusively for Pro members.
              </p>
              <DeepReadingSection />
            </div>
          )}

          {/* Low usage warning */}
          {remaining !== null && remaining <= 1 && session && !isPro && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-200 text-center">
              🌟 Only <strong>{remaining}</strong> reading left today.{' '}
              <Link href="/pricing" className="underline text-gold">Upgrade to Pro</Link> for unlimited reads.
            </div>
          )}

          <button
            onClick={() => { setState('idle'); setSelected(null); setHoroscope(null); setSaved(false); setIsDeep(false) }}
            className="w-full mt-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
            Check Another Sign
          </button>
        </div>
      )}
    </main>
  )
}
