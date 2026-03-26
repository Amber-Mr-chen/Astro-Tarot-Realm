'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function YesNoPage() {
  const { data: session } = useSession()
  const [question, setQuestion] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [result, setResult] = useState<{ card: { name: string; isReversed: boolean }; reading: string; answer: string } | null>(null)
  const [saved, setSaved] = useState(false)

  async function ask() {
    if (!question.trim()) return
    setState('loading')
    setSaved(false)
    const res = await fetch('/api/tarot/yesno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    const data = await res.json()
    setResult(data)
    setState('done')

    if (session?.user?.email) {
      await fetch('/api/reading/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          type: 'yes-no',
          question: question,
          result: `Answer: ${data.answer}\n${data.card.name} ${data.card.isReversed ? '(Reversed)' : '(Upright)'}\n\n${data.reading}`
        })
      })
      setSaved(true)
    }
  }

  const shareText = result ? `I asked the tarot: "${question}" — The answer is ${result.answer}! ✨ Try it at AstraTarot` : ''

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Seek Clarity ✦</div>
      <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-textMain mb-4">Yes or No Tarot</h1>
      <p className="text-textSub mb-10 max-w-md">Ask a question and let the cards reveal the answer.</p>

      {state !== 'done' && (
        <div className="w-full max-w-md">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here... (e.g. Should I take this new opportunity?)"
            maxLength={100}
            rows={3}
            className="w-full rounded-xl p-4 text-textMain resize-none outline-none focus:ring-2 focus:ring-primary"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}
          />
          <button onClick={ask} disabled={!question.trim() || state === 'loading'}
            className="mt-4 w-full py-4 rounded-full font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
            {state === 'loading' ? 'The cards are speaking...' : '✨ Ask the Cards'}
          </button>
        </div>
      )}

      {state === 'done' && result && (
        <div className="max-w-lg w-full rounded-2xl p-8 text-left"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}>
          <div className="text-center mb-6">
            <div className={`text-6xl font-cinzel font-bold mb-2 ${result.answer === 'Yes' ? 'text-green-400' : 'text-red-400'}`}>
              {result.answer}
            </div>
            <div className="text-gold font-cinzel">{result.card.name} {result.card.isReversed ? '(Reversed)' : '(Upright)'}</div>
          </div>
          <p className="text-textMain leading-relaxed">{result.reading}</p>
          {saved && <p className="text-green-400 text-sm mt-3 text-center">✓ Reading saved to your history</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={() => { setState('idle'); setResult(null); setQuestion(''); setSaved(false) }}
              className="flex-1 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)', color: 'white' }}>
              Ask Another
            </button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex-1 py-3 rounded-full text-sm font-semibold text-center transition-all hover:opacity-80"
              style={{ backgroundColor: '#1DA1F2', color: 'white' }}>
              Share on Twitter
            </a>
          </div>
        </div>
      )}
    </main>
  )
}
