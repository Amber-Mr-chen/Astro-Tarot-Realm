'use client'
import { useState } from 'react'

type State = 'closed' | 'open' | 'submitted'

export default function FeedbackWidget() {
  const [state, setState] = useState<State>('closed')
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!rating) return
    setLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
    } catch { /* silent */ }
    setLoading(false)
    setState('submitted')
    setTimeout(() => {
      setState('closed')
      setRating(0)
      setComment('')
    }, 3000)
  }

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2">
      {/* Feedback panel */}
      {state === 'open' && (
        <div
          className="rounded-2xl p-5 w-72 shadow-2xl"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.4)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="font-cinzel text-sm font-semibold text-gold">How are we doing?</span>
            <button
              onClick={() => setState('closed')}
              className="text-textSub hover:text-textMain transition-colors text-lg leading-none"
            >×</button>
          </div>

          {/* Star rating */}
          <div className="flex gap-1 mb-4 justify-center">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                <span style={{ color: n <= (hovered || rating) ? '#C9A84C' : '#3D3558' }}>★</span>
              </button>
            ))}
          </div>

          {/* Optional comment */}
          {rating > 0 && (
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Anything you'd like to share? (optional)"
              rows={3}
              className="w-full bg-bg border border-purple-900/40 rounded-lg px-3 py-2 text-sm text-textMain placeholder-textSub/50 focus:outline-none focus:border-gold resize-none mb-3 transition-colors"
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!rating || loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-bg transition-all disabled:opacity-40"
            style={{ background: rating ? 'linear-gradient(135deg, #C9A84C, #E8C96D)' : '#3D3558' }}
          >
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </div>
      )}

      {/* Submitted thank-you */}
      {state === 'submitted' && (
        <div
          className="rounded-2xl px-5 py-4 shadow-2xl text-center"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(201,168,76,0.4)' }}
        >
          <div className="text-2xl mb-1">✨</div>
          <p className="text-gold text-sm font-semibold">Thank you!</p>
          <p className="text-textSub text-xs mt-0.5">Your feedback means a lot.</p>
        </div>
      )}

      {/* Floating trigger button */}
      {state !== 'submitted' && (
        <button
          onClick={() => setState(s => s === 'open' ? 'closed' : 'open')}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{
            background: state === 'open'
              ? 'linear-gradient(135deg, #6C3483, #9B59B6)'
              : 'linear-gradient(135deg, #C9A84C, #E8C96D)',
          }}
          aria-label="Give feedback"
          title="Share your feedback"
        >
          <span className="text-lg">{state === 'open' ? '×' : '💬'}</span>
        </button>
      )}
    </div>
  )
}
