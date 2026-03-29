'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import ShareButton from '../share-button'
import DeepReadingPreview from '../deep-reading-preview'
import ExploreMore from '../explore-more'

type DeepReading = {
  symbol: string
  timeline: { past: string; present: string; future: string }
  love: string
  career: string
  growth: string
  action: string
}

type Result = {
  card: { name: string; isReversed: boolean }
  reading: string | null
  deepReading?: DeepReading | null
  remaining: number
  deepRemaining?: number
  plan?: string
  isDeep?: boolean
}

function DeepReadingView({ dr }: { dr: DeepReading }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        <h3 className="font-cinzel text-sm font-bold text-gold mb-2 uppercase tracking-wider">✦ Card Energy</h3>
        <p className="text-textMain leading-relaxed">{String(dr.symbol)}</p>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        <h3 className="font-cinzel text-sm font-bold text-gold mb-3 uppercase tracking-wider">⏳ Past · Present · Future</h3>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-textSub uppercase tracking-wider">Past</span>
            <p className="text-textMain leading-relaxed mt-1">{String(dr.timeline?.past ?? '')}</p>
          </div>
          <div>
            <span className="text-xs text-textSub uppercase tracking-wider">Present</span>
            <p className="text-textMain leading-relaxed mt-1">{String(dr.timeline?.present ?? '')}</p>
          </div>
          <div>
            <span className="text-xs text-textSub uppercase tracking-wider">Future</span>
            <p className="text-textMain leading-relaxed mt-1">{String(dr.timeline?.future ?? '')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
          <h3 className="font-cinzel text-sm font-bold text-gold mb-2 uppercase tracking-wider">💕 Love & Relationships</h3>
          <p className="text-textMain leading-relaxed">{String(dr.love ?? '')}</p>
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
          <h3 className="font-cinzel text-sm font-bold text-gold mb-2 uppercase tracking-wider">💼 Career</h3>
          <p className="text-textMain leading-relaxed">{String(dr.career ?? '')}</p>
        </div>
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        <h3 className="font-cinzel text-sm font-bold text-gold mb-2 uppercase tracking-wider">🌱 Inner Growth</h3>
        <p className="text-textMain leading-relaxed">{String(dr.growth ?? '')}</p>
      </div>

      <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.08), rgba(155,89,182,0.08))', border: '1px solid rgba(243,156,18,0.3)' }}>
        <h3 className="font-cinzel text-sm font-bold text-gold mb-2 uppercase tracking-wider">⚡ Today's Action</h3>
        <p className="text-textMain leading-relaxed">{String(dr.action ?? '')}</p>
      </div>
    </div>
  )
}

export default function TarotPage() {
  const { data: session } = useSession()
  const [state, setState] = useState<'idle' | 'flipping' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function drawCard(deep = false, existingCard?: { name: string; isReversed: boolean }) {
    setState('flipping')
    setSaved(false)
    setError(null)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setState('loading')

    const res = await fetch('/api/tarot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deep, card: existingCard ?? null })
    })
    const data = await res.json()

    if (res.status === 429 || res.status === 403) {
      setError(String(data.message ?? 'Limit reached'))
      setState('idle')
      return
    }

    setResult(data)
    setState('done')

    if (session?.user?.email) {
      const saveText = deep && data.deepReading
        ? [
            data.card?.name + ' ' + (data.card?.isReversed ? '(Reversed)' : '(Upright)'),
            data.deepReading.symbol ? `ENERGY:\n${data.deepReading.symbol}` : '',
            data.deepReading.timeline?.past ? `PAST:\n${data.deepReading.timeline.past}` : '',
            data.deepReading.timeline?.present ? `PRESENT:\n${data.deepReading.timeline.present}` : '',
            data.deepReading.timeline?.future ? `FUTURE:\n${data.deepReading.timeline.future}` : '',
            data.deepReading.love ? `LOVE:\n${data.deepReading.love}` : '',
            data.deepReading.career ? `CAREER:\n${data.deepReading.career}` : '',
            data.deepReading.growth ? `GROWTH:\n${data.deepReading.growth}` : '',
            data.deepReading.action ? `ACTION:\n${data.deepReading.action}` : '',
          ].filter(Boolean).join('\n\n')
        : `${data.card?.name} ${data.card?.isReversed ? '(Reversed)' : '(Upright)'}\n\n${data.reading ?? ''}`
      await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          type: deep ? 'tarot-deep' : 'tarot',
          question: null,
          result: saveText
        })
      })
      setSaved(true)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 text-center">
      <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Reading ✦</div>
      <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Tarot</h1>
      <p className="text-textSub mb-12 max-w-md">Focus your mind, take a breath, and draw your card for today.</p>

      {error && (
        <div className="max-w-md w-full rounded-2xl p-6 mb-8 text-left"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <div className="text-red-400 font-semibold mb-2">Limit Reached</div>
          <p className="text-textSub text-sm mb-4">{error}</p>
          {!session ? (
            <button onClick={() => signIn('google')} className="w-full py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
              Sign In for 3 Free Readings
            </button>
          ) : (
            <Link href="/pricing" className="block w-full py-2 rounded-full text-sm font-semibold text-center text-white"
              style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
              Upgrade to Pro →
            </Link>
          )}
        </div>
      )}

      {state === 'idle' && !error && (
        <div className="flex flex-col items-center gap-6 mb-8">
          <p className="text-textSub text-sm">Choose a card — focus your energy and let the universe guide you</p>
          <div className="flex gap-6">
            {[0, 1, 2].map((i) => (
              <button key={i} onClick={() => drawCard(false)}
                className="group w-28 h-44 md:w-36 md:h-56 rounded-xl cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-2"
                style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D1B69)', border: '2px solid #9B59B6', boxShadow: '0 0 20px rgba(155,89,182,0.3)' }}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className="text-4xl group-hover:scale-110 transition-transform">✦</div>
                  <div className="text-xs text-textSub font-cinzel tracking-wider">TAROT</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {state === 'flipping' && (
        <div className="flex flex-col items-center mb-8">
          <style>{`
            @keyframes cardFlip {
              0% { transform: rotateY(0deg) scale(1); }
              50% { transform: rotateY(90deg) scale(1.2); }
              100% { transform: rotateY(0deg) scale(1.3); }
            }
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 20px rgba(155,89,182,0.4); }
              50% { box-shadow: 0 0 60px rgba(155,89,182,0.9), 0 0 100px rgba(243,156,18,0.4); }
            }
            .flip-card { animation: cardFlip 1.2s ease-in-out forwards, glow 1.5s ease-in-out infinite; }
          `}</style>
          <div className="flip-card w-36 h-56 rounded-xl flex items-center justify-center text-7xl"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', border: '3px solid #F39C12' }}>
            🃏
          </div>
          <p className="text-gold text-lg mt-6 animate-pulse">Your card is revealing itself...</p>
        </div>
      )}

      {state === 'loading' && (
        <div className="text-primary text-lg animate-pulse mb-8">The cards are speaking...</div>
      )}

      {state === 'done' && result && (
        <div className="max-w-3xl w-full space-y-4 text-left">
          {/* Card Header */}
          <div className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}>
            <div className="text-5xl mb-3">🃏</div>
            <h2 className="font-cinzel text-2xl font-bold text-gold">{result.card.name}</h2>
            <p className="text-textSub text-sm mt-1">{result.card.isReversed ? 'Reversed' : 'Upright'}</p>
            {result.isDeep && (
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full text-gold"
                style={{ border: '1px solid rgba(243,156,18,0.4)', backgroundColor: 'rgba(243,156,18,0.08)' }}>
                ✨ Deep Reading
              </span>
            )}
          </div>

          {/* Standard Reading */}
          {!result.isDeep && result.reading && (
            <div className="rounded-2xl p-6" style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
              <p className="text-textMain leading-relaxed">{result.reading}</p>
            </div>
          )}

          {/* Deep Reading */}
          {result.isDeep && result.deepReading && (
            <DeepReadingView dr={result.deepReading} />
          )}

          {saved && <p className="text-green-400 text-sm text-center">✓ Reading saved to your history</p>}

          {/* Share */}
          <div className="flex justify-center">
            <ShareButton text={`I drew ${result.card.name} ${result.card.isReversed ? '(Reversed)' : '(Upright)'} on TarotRealm today ✨\n\n"${(result.reading ?? '').slice(0, 120)}…"\n\nGet your free reading → tarotrealm.xyz/tarot`} />
          </div>

          {/* Upsell: Free 用户普通解读后显示预览；Pro 用户显示深度解读按钮 */}
          {!result.isDeep && result.plan !== 'pro' && (
            <DeepReadingPreview cardName={result.card.name} />
          )}
          {!result.isDeep && result.plan === 'pro' && (
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <p className="text-sm text-textSub mb-3">
                Want the full picture? <strong className="text-textMain">Deep Reading</strong> reveals past-present-future, love, career, inner growth & today's action.
              </p>
              <button onClick={() => drawCard(true, result.card)}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white hover:opacity-80"
                style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                ✨ Get Deep Reading
              </button>
            </div>
          )}

          <ExploreMore items={[
            { icon: '✨', title: 'Yes or No Tarot', desc: 'Ask a direct question, get a clear answer', href: '/yes-no-tarot' },
            { icon: '⭐', title: 'Daily Horoscope', desc: 'Check what the stars say for your sign', href: '/horoscope' },
          ]} />

          <button onClick={() => { setState('idle'); setResult(null); setSaved(false); setError(null) }}
            className="w-full py-3 rounded-full text-sm font-semibold text-white hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            Draw Another Card
          </button>
        </div>
      )}
    </main>
  )
}
