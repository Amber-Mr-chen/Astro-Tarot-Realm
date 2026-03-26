'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Reading = {
  id: string
  type: string
  question: string | null
  result: string
  created_at: number
}

const typeLabel: Record<string, string> = {
  tarot: '🃏 Daily Tarot',
  'yes-no': '✨ Yes or No',
  horoscope: '⭐ Horoscope',
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/history?email=${encodeURIComponent(session.user.email)}`)
        .then(r => r.json())
        .then(data => {
          setReadings(data.readings || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else if (status !== 'loading') {
      setLoading(false)
    }
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="text-5xl mb-6">🔮</div>
        <h1 className="font-cinzel text-3xl font-bold text-textMain mb-4">Your Reading History</h1>
        <p className="text-textSub mb-8">Sign in to view your past readings.</p>
        <button onClick={() => signIn('google')}
          className="px-8 py-4 rounded-full font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
          Sign In with Google
        </button>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Your Journey ✦</div>
        <h1 className="font-cinzel text-4xl font-bold text-textMain mb-2">Reading History</h1>
        <p className="text-textSub">Welcome back, {session.user?.name}</p>
      </div>

      {readings.length === 0 ? (
        <div className="text-center text-textSub py-20">
          <div className="text-5xl mb-4">🃏</div>
          <p>No readings yet. Start your journey!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {readings.map((r) => (
            <div key={r.id} className="rounded-2xl p-6"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-cinzel text-gold text-sm">{typeLabel[r.type] || r.type}</span>
                <span className="text-textSub text-xs">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {r.question && (
                <p className="text-textSub text-sm italic mb-2">"{r.question}"</p>
              )}
              <p className="text-textMain text-sm leading-relaxed whitespace-pre-line line-clamp-4">{r.result}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
