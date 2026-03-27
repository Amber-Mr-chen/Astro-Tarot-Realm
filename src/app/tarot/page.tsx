'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

export default function TarotPage() {
  const { data: session } = useSession()
  const [state, setState] = useState<'idle' | 'flipping' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<{ card: { name: string; isReversed: boolean }; reading: string; remaining: number; deepRemaining?: number; isDeep?: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [userPlan, setUserPlan] = useState<string>('free')

  async function drawCard(deep = false) {
    setState('flipping')
    setSaved(false)
    setError(null)
    
    // Wait for flip animation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setState('loading')
    const res = await fetch('/api/tarot', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deep })
    })
    const data = await res.json()

    if (res.status === 429 || res.status === 403) {
      setError(data.message)
      setState('idle')
      return
    }

    setResult(data)
    setState('done')

    if (session?.user?.email) {
      await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          type: deep ? 'tarot-deep' : 'tarot',
          question: null,
          result: `${data.card.name} ${data.card.isReversed ? '(Reversed)' : '(Upright)'}\n\n${data.reading}`
        })
      })
      setSaved(true)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Daily Reading ✦</div>
      <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Daily Tarot</h1>
      <p className="text-textSub mb-12 max-w-md">Focus your mind, take a breath, and draw your card for today.</p>

      {error && (
        <div className="max-w-md w-full rounded-2xl p-6 mb-8 text-left"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <div className="text-red-400 font-semibold mb-2">Daily Limit Reached</div>
          <p className="text-textSub text-sm mb-4">{error}</p>
          {!session ? (
            <button onClick={() => signIn('google')}
              className="w-full py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
              Sign In for 3 Free Readings
            </button>
          ) : (
            <Link href="/pricing"
              className="block w-full py-2 rounded-full text-sm font-semibold text-center text-white"
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

      {/* Flip Animation */}
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
            .flip-card {
              animation: cardFlip 1.2s ease-in-out forwards, glow 1.5s ease-in-out infinite;
            }
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
        <div className="max-w-3xl w-full space-y-4">
          {/* Result Card */}
          <div className="rounded-2xl p-8 text-left"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🃏</div>
              <h2 className="font-cinzel text-2xl font-bold text-gold">{result.card.name}</h2>
              <span className="text-textSub text-sm">{result.card.isReversed ? 'Reversed' : 'Upright'}</span>
              {result.isDeep && (
                <div className="mt-2">
                  <span className="text-xs px-3 py-1 rounded-full text-gold"
                    style={{ border: '1px solid rgba(243,156,18,0.4)', backgroundColor: 'rgba(243,156,18,0.1)' }}>
                    ✨ Deep Reading
                  </span>
                </div>
              )}
            </div>
            <div className="text-textMain leading-relaxed space-y-3">
              <p className="whitespace-normal break-words">{result.reading}</p>
            </div>
            {saved && <p className="text-green-400 text-sm text-center mt-4">✓ Reading saved to your history</p>}
          </div>

          {/* Deep Reading Upsell */}
          {!result.isDeep && (
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <p className="text-sm text-textSub mb-3">
                Want a <strong className="text-textMain">comprehensive analysis</strong> covering love, career, shadow work & personal growth? Deep Reading unlocks the full wisdom of this card.
              </p>
              {session ? (
                <button onClick={() => drawCard(true)}
                  className="px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  ✨ Get Deep Reading (Pro)
                </button>
              ) : (
                <Link href="/pricing"
                  className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  Upgrade to Pro →
                </Link>
              )}
            </div>
          )}

          {/* Warnings */}
          {result.deepRemaining !== undefined && result.deepRemaining <= 2 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-200">
              ⚡ {result.deepRemaining} deep readings left today
            </div>
          )}
          {result.remaining <= 1 && !session && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-yellow-200">
              📌 You have <strong>{result.remaining}</strong> free reading left today. <button onClick={() => signIn('google')} className="underline">Sign in</button> for 3 total.
            </div>
          )}

          {/* Action Button */}
          <button onClick={() => { setState('idle'); setResult(null); setSaved(false); setError(null) }}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
            Draw Another Card
          </button>
        </div>
      )}
    </main>
  )
}
