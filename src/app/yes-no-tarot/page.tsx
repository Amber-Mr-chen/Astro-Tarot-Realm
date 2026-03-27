'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

type Result = {
  card: { name: string; isReversed: boolean }
  reading: string
  answer: string
  remaining: number
  deepRemaining?: number
  isDeep?: boolean
}

export default function YesNoPage() {
  const { data: session } = useSession()
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function ask(deep = false, existingCard?: { name: string; isReversed: boolean }) {
    if (!question.trim()) return
    setState('loading')
    setSaved(false)
    setError(null)
    const res = await fetch('/api/tarot/yesno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, deep, card: existingCard ?? null }),
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
          type: deep ? 'yes-no-deep' : 'yes-no',
          question,
          result: `Answer: ${data.answer}\n${data.card.name} ${data.card.isReversed ? '(Reversed)' : '(Upright)'}\n\n${data.reading}`
        })
      })
      setSaved(true)
    }
  }

  const shareText = result
    ? `I asked the tarot: "${question}" — The answer is ${result.answer}! ✨ Try it at TarotRealm https://tarotrealm.xyz/yes-no-tarot`
    : ''

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Seek Clarity ✦</div>
      <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Yes or No Tarot</h1>
      <p className="text-textSub mb-10 max-w-md">Ask a question and let the cards reveal the answer.</p>

      {/* Error */}
      {error && (
        <div className="max-w-md w-full rounded-2xl p-6 mb-6 text-left"
          style={{ backgroundColor: '#2D1B1B', border: '1px solid rgba(220,53,69,0.3)' }}>
          <div className="text-red-400 font-semibold mb-2">Limit Reached</div>
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

      {/* Input */}
      {state !== 'done' && (
        <div className="w-full max-w-md">
          {!session && (
            <div className="rounded-xl p-3 mb-4 text-sm"
              style={{ backgroundColor: 'rgba(155,89,182,0.1)', border: '1px solid rgba(155,89,182,0.3)' }}>
              <span className="text-textSub">✨ <button onClick={() => signIn('google')} className="text-gold underline">Sign in</button> to unlock 3 free readings/day + history</span>
            </div>
          )}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here... (e.g. Should I take this new opportunity?)"
            maxLength={100}
            rows={3}
            className="w-full rounded-xl p-4 text-textMain resize-none outline-none focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}
          />
          <button onClick={() => ask(false)} disabled={!question.trim() || state === 'loading'}
            className="mt-4 w-full py-4 rounded-full font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            {state === 'loading' ? 'The cards are speaking...' : '✨ Ask the Cards'}
          </button>
        </div>
      )}

      {/* Result */}
      {state === 'done' && result && (
        <div className="max-w-3xl w-full space-y-4">

          {/* Answer Card */}
          <div className="rounded-2xl p-8 text-left"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}>
            <div className="text-center mb-6">
              <div className={`text-6xl font-cinzel font-bold mb-2 ${result.answer === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
                {result.answer}
              </div>
              <div className="text-gold font-cinzel text-sm">
                {result.card.name} · {result.card.isReversed ? 'Reversed' : 'Upright'}
              </div>
              {result.isDeep && (
                <div className="mt-2">
                  <span className="text-xs px-3 py-1 rounded-full text-gold"
                    style={{ border: '1px solid rgba(243,156,18,0.4)', backgroundColor: 'rgba(243,156,18,0.1)' }}>
                    ✨ Deep Reading
                  </span>
                </div>
              )}
            </div>
            <div className="text-textMain leading-relaxed whitespace-pre-line space-y-4">
              {result.reading.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
            {saved && <p className="text-green-400 text-sm text-center mt-4">✓ Reading saved to your history</p>}
          </div>

          {/* Deep Reading Upsell — only show after standard reading */}
          {!result.isDeep && (
            <div className="rounded-xl p-4 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(243,156,18,0.1), rgba(155,89,182,0.1))', border: '1px solid rgba(243,156,18,0.3)' }}>
              <p className="text-sm text-textSub mb-3">
                Want to know <strong className="text-textMain">why</strong> and <strong className="text-textMain">what to do next</strong>? Deep Reading reveals hidden energies and detailed guidance.
              </p>
              {session ? (
                <button onClick={() => ask(true, result.card)}
                  className="px-6 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                  style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                  ✨ Get Deep Reading (Pro)
                </button>
              ) : (
                <div className="space-y-2">
                  <Link href="/pricing"
                    className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
                    Upgrade to Pro →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button onClick={() => { setState('idle'); setResult(null); setQuestion(''); setSaved(false) }}
              className="flex-1 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
              Ask Another
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 rounded-full text-sm font-semibold text-center transition-all hover:opacity-80"
              style={{ backgroundColor: '#1DA1F2', color: 'white' }}>
              Share on X
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
