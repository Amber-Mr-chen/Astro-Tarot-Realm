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

  async function getHoroscope(sign: string, deep = false) {
    setSelected(sign)
    setState('loading')
    setSaved(false)
    setError(null)

    const res = await fetch('/api/horoscope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sign, deep }),
    })
    const data = await res.json()

    if (res.status === 429 || res.status === 403) {
      setError(data.message)
      setState('idle')
      return
    }

    setHoroscope(data.horoscope)
    setRemaining(data.remaining ?? null)
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

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Forecast ✦</div>
        <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Horoscope</h1>
        <p className="text-textSub max-w-md mx-auto">Select your zodiac sign for your personalized daily forecast.</p>
      </div>

      {/* Upgrade hint for free users */}
      {!session ? (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)' }}>
          ✨ <button onClick={() => signIn('google')} className="text-gold underline">Sign in</button> for 3 free readings/day · <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> for unlimited + deep readings
        </div>
      ) : (
        <div className="rounded-xl p-3 mb-6 text-center text-sm"
          style={{ backgroundColor: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.2)' }}>
          🌟 Want a deeper, more detailed reading? <Link href="/pricing" className="text-gold underline">Upgrade to Pro</Link> to unlock Deep Readings (10/day)
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-6 mb-6"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <div className="text-red-400 font-semibold mb-2">Daily Limit Reached</div>
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

      <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-6">
        {ZODIAC_SIGNS.map((z) => (
          <button key={z.name} onClick={() => getHoroscope(z.name, false)}
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

      {/* Deep Reading Option */}
      <div className="rounded-xl p-4 mb-6 text-center"
        style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
        <p className="text-sm text-textSub mb-2">✨ <strong className="text-gold">Deep Reading</strong> — detailed planetary insights, love & career deep dive (Pro only)</p>
        {session ? (
          <div className="flex flex-wrap justify-center gap-2">
            {ZODIAC_SIGNS.map((z) => (
              <button key={z.name} onClick={() => getHoroscope(z.name, true)}
                className="px-3 py-1 rounded-full text-xs font-semibold text-white transition-all hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                {z.emoji} {z.name}
              </button>
            ))}
          </div>
        ) : (
          <Link href="/pricing" className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
            Upgrade to Pro →
          </Link>
        )}
      </div>

      {/* Quick links to individual sign pages */}
      <div className="rounded-xl p-4 mb-8 text-center text-sm"
        style={{ backgroundColor: 'rgba(155,89,182,0.05)', border: '1px solid rgba(155,89,182,0.2)' }}>
        <p className="text-textSub mb-3">Or visit your sign's dedicated page:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {ZODIAC_SIGNS.map((z) => (
            <Link key={z.name} href={`/horoscope/${z.name.toLowerCase()}`}
              className="px-3 py-1 rounded-full text-xs transition-all hover:bg-primary/20"
              style={{ border: '1px solid rgba(155,89,182,0.3)', color: '#9B59B6' }}>
              {z.emoji} {z.name}
            </Link>
          ))}
        </div>
      </div>

      {state === 'loading' && (
        <div className="text-center text-primary text-lg animate-pulse">Reading the stars for {selected}...</div>
      )}

      {state === 'done' && horoscope && (
        <div className="space-y-4">
          <h2 className="font-cinzel text-2xl text-center text-gold mb-6">
            {ZODIAC_SIGNS.find(z => z.name === selected)?.emoji} {selected} — Today's Reading
            {isDeep && <span className="text-xs ml-2">✨ Deep</span>}
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
          {remaining !== null && remaining <= 1 && session && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-sm text-purple-200 text-center">
              🌟 Only <strong>{remaining}</strong> reading left today. <Link href="/pricing" className="underline text-gold">Upgrade to Pro</Link> for unlimited + 10 deep readings/day.
            </div>
          )}
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
