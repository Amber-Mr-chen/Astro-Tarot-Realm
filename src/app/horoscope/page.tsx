'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { ZODIAC_SIGNS } from '@/lib/tarot'
import Link from 'next/link'

type Horoscope = {
  love: { text: string; stars: number }
  career: { text: string; stars: number }
  money: { text: string; stars: number }
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
  const [userPlan, setUserPlan] = useState<string>('free')

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

    setHoroscope(data.horoscope)
    setRemaining(data.remaining ?? null)
    setDeepRemaining(data.deepRemaining ?? null)
    setUserPlan(data.plan ?? 'free')
    setIsDeep(deep)
    setState('done')

    if (session?.user?.email) {
      const resultText = `Love: ${data.horoscope.love.stars}★ - ${data.horoscope.love.text}\n\nCareer: ${data.horoscope.career.stars}★ - ${data.horoscope.career.text}\n\nMoney: ${data.horoscope.money.stars}★ - ${data.horoscope.money.text}`
      await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email, type: 'horoscope', question: sign, result: resultText })
      })
      setSaved(true)
    }
  }

  const selectedSign = ZODIAC_SIGNS.find(z => z.name === selected)
  const isPro = userPlan === 'pro'

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Forecast ✦</div>
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Horoscope</h1>
        <p className="text-textSub max-w-md mx-auto">Select your zodiac sign for your personalized daily forecast.</p>
      </div>

      {/* Login / upgrade hint */}
      {!session ? (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)' }}>
          ✨ <button onClick={() => signIn('google')} className="text-gold underline">Sign in</button> for 3 free readings/day · <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> for unlimited + deep readings
        </div>
      ) : !isPro ? (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2)' }}>
          🌟 Want deeper insights? <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> to unlock Deep Readings (10/day)
        </div>
      ) : null}

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

      {/* Zodiac grid — bigger, colorful, always visible */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {ZODIAC_SIGNS.map((z) => {
          const isSelected = selected === z.name
          return (
            <button key={z.name} onClick={() => getHoroscope(z.name, false)}
              className="rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: isSelected ? z.color : z.bg,
                border: `2px solid ${isSelected ? z.color : z.color + '55'}`,
                boxShadow: isSelected ? `0 0 20px ${z.color}55` : 'none',
              }}>
              <div className="text-4xl mb-2" style={{ color: isSelected ? '#fff' : z.color }}>{z.emoji}</div>
              <div className="font-cinzel font-bold text-sm" style={{ color: isSelected ? '#fff' : z.color }}>{z.name}</div>
              <div className="text-xs mt-1 opacity-70" style={{ color: isSelected ? '#fff' : z.color }}>{z.dates}</div>
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {state === 'loading' && (
        <div className="text-center text-primary text-lg animate-pulse py-8">Reading the stars for {selected}...</div>
      )}

      {/* Results */}
      {state === 'done' && horoscope && (
        <div className="space-y-4">
          <h2 className="font-cinzel text-2xl text-center mb-6" style={{ color: selectedSign?.color ?? '#F39C12' }}>
            {selectedSign?.emoji} {selected} — Today's Reading
            {isDeep && <span className="text-xs ml-2 text-gold">✨ Deep</span>}
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

          {/* Deep Reading upsell — only shown after standard reading */}
          {!isDeep && (
            <div className="rounded-2xl p-6 text-center mt-4"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.08), rgba(155,89,182,0.08))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <div className="text-gold font-cinzel text-lg mb-2">✨ Unlock Your Deep Reading</div>
              <p className="text-textSub text-sm mb-4">
                Detailed planetary insights, deeper love & career analysis — exclusively for Pro members.
              </p>

              {/* Not logged in */}
              {!session && (
                <button onClick={() => signIn('google')}
                  className="px-6 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
                  Sign In to Continue
                </button>
              )}

              {/* Logged in, not Pro */}
              {session && !isPro && (
                <Link href="/pricing"
                  className="inline-block px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  Upgrade to Pro →
                </Link>
              )}

              {/* Pro user, has remaining */}
              {session && isPro && (deepRemaining === null || deepRemaining > 0) && (
                <button onClick={() => selected && getHoroscope(selected, true)} disabled={deepLoading}
                  className="px-8 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  {deepLoading ? 'Reading the stars...' : `✨ Get Deep Reading for ${selected}`}
                </button>
              )}

              {/* Pro user, exhausted */}
              {session && isPro && deepRemaining !== null && deepRemaining <= 0 && (
                <p className="text-textSub text-sm">You've used all 10 deep readings today. Come back tomorrow!</p>
              )}

              {session && isPro && deepRemaining !== null && deepRemaining > 0 && (
                <p className="text-textSub text-xs mt-2">{deepRemaining} deep readings remaining today</p>
              )}
            </div>
          )}

          {/* Low usage warning */}
          {remaining !== null && remaining <= 1 && session && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-200 text-center">
              🌟 Only <strong>{remaining}</strong> reading left today. <Link href="/pricing" className="underline text-gold">Upgrade to Pro</Link> for unlimited reads.
            </div>
          )}

          <button onClick={() => { setState('idle'); setSelected(null); setHoroscope(null); setSaved(false); setIsDeep(false) }}
            className="w-full mt-4 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
            Check Another Sign
          </button>
        </div>
      )}
    </main>
  )
}
