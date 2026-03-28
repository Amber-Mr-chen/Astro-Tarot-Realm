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

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  'tarot':         { label: 'Daily Tarot',       icon: '🃏', color: '#C9A84C' },
  'tarot-deep':    { label: 'Deep Tarot',         icon: '🔮', color: '#A855F7' },
  'yes-no':        { label: 'Yes or No',          icon: '✨', color: '#F39C12' },
  'yes-no-deep':   { label: 'Yes or No (Deep)',   icon: '✨', color: '#E67E22' },
  'horoscope':     { label: 'Horoscope',          icon: '⭐', color: '#9B59B6' },
  'birth-chart':   { label: 'Birth Chart',        icon: '🌌', color: '#3B82F6' },
  'compatibility': { label: 'Compatibility',      icon: '💫', color: '#EC4899' },
}

// Parse result field into a clean display object
function parseResult(type: string, result: string): { summary: string; full: string } {
  const trimmed = result.trim()

  // Horoscope — stored as JSON
  if (type === 'horoscope') {
    try {
      const parsed = JSON.parse(trimmed)
      const parts: string[] = []
      for (const key of ['energy', 'love', 'career', 'money', 'advice']) {
        const val = parsed[key]
        if (val?.text) parts.push(val.text)
        else if (typeof val === 'string') parts.push(val)
      }
      const full = parts.join('\n\n')
      return { summary: parts[0] ?? trimmed, full: full || trimmed }
    } catch {
      return { summary: trimmed.slice(0, 200), full: trimmed }
    }
  }

  // Birth chart or compatibility — stored as JSON
  if (type === 'birth-chart' || type === 'compatibility') {
    try {
      const parsed = JSON.parse(trimmed)
      // Compatibility stores {scores, reading: {...}}, birth-chart stores reading directly
      const readingObj = parsed.reading ?? parsed
      const parts: string[] = []
      for (const key of ['overall', 'identity', 'emotion', 'strength', 'love', 'career', 'purpose', 'challenge', 'advice']) {
        if (typeof readingObj[key] === 'string') parts.push(readingObj[key])
      }
      // For compatibility, prepend score info as context
      const scoreHeader = parsed.scores
        ? `Overall ${parsed.scores.overall}% · Love ${parsed.scores.love}% · Friendship ${parsed.scores.friendship}% · Work ${parsed.scores.work}%`
        : ''
      const full = [scoreHeader, ...parts].filter(Boolean).join('\n\n')
      const summary = scoreHeader
        ? `${scoreHeader}\n\n${parts[0] ?? ''}`
        : (parts[0] ?? trimmed)
      return { summary, full: full || trimmed }
    } catch {
      return { summary: trimmed.slice(0, 200), full: trimmed }
    }
  }

  // Yes/No — "Answer: Yes\nCard Name\n\nReading text"
  if (type === 'yes-no' || type === 'yes-no-deep') {
    const lines = trimmed.split('\n').filter(Boolean)
    const header = lines.slice(0, 2).join(' · ')
    const body = lines.slice(2).join('\n').trim()
    return {
      summary: header + (body ? '\n' + body.slice(0, 150) : ''),
      full: trimmed,
    }
  }

  // Tarot (regular and deep) — first line is card name, rest is reading
  // Deep tarot has labeled sections: ENERGY:\n...\n\nPAST:\n...
  const lines = trimmed.split('\n').filter(Boolean)
  const cardLine = lines[0] ?? ''
  const body = trimmed.slice(cardLine.length).trim()
  // Summary = card name + first paragraph only (up to first double newline)
  const firstPara = body.split('\n\n')[0]?.trim() ?? ''
  return {
    summary: cardLine + (firstPara ? '\n\n' + firstPara : ''),
    full: trimmed,
  }
}

function ReadingCard({ reading }: { reading: Reading }) {
  const [expanded, setExpanded] = useState(false)
  const meta = TYPE_META[reading.type] ?? { label: reading.type, icon: '📖', color: '#9B59B6' }
  const { summary, full } = parseResult(reading.type, reading.result)
  // Has more if full content is meaningfully longer than summary (more than 50 chars difference)
  const hasMore = full.trim().length > summary.trim().length + 50

  const date = new Date(reading.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      translate="no"
      style={{
        backgroundColor: '#1A1A2E',
        border: '1px solid rgba(155,89,182,0.25)',
        borderLeft: `3px solid ${meta.color}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.icon}</span>
          <span className="font-cinzel text-sm font-semibold" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <span className="text-textSub text-xs">{date}</span>
      </div>

      {/* Question (for yes-no / horoscope sign) */}
      {reading.question && (
        <p className="text-textSub text-xs italic mb-2 truncate">
          {reading.type === 'horoscope' ? `♈ ${reading.question}` : `"${reading.question}"`}
        </p>
      )}

      {/* Content */}
      <p className="text-textMain text-sm leading-relaxed whitespace-pre-line">
        {expanded ? full : summary}
        {!expanded && full.length > summary.length + 10 && '...'}
      </p>

      {/* Expand / Collapse */}
      {hasMore && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 text-xs transition-colors"
          style={{ color: meta.color }}
        >
          {expanded ? '▲ Show less' : '▼ Read full reading'}
        </button>
      )}
    </div>
  )
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
        <div className="text-textSub animate-pulse font-cinzel">Reading the stars...</div>
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
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-4xl mb-3">📖</div>
        <h1 className="font-cinzel text-3xl font-bold text-gold mb-1">Reading History</h1>
        <p className="text-textSub text-sm">Welcome back, {session.user?.name}</p>
      </div>

      {readings.length === 0 ? (
        <div className="text-center text-textSub py-20">
          <div className="text-5xl mb-4">🃏</div>
          <p className="mb-2">No readings yet.</p>
          <p className="text-xs">Start with a tarot reading or daily horoscope.</p>
        </div>
      ) : (
        <>
          <p className="text-textSub text-xs text-right mb-4">{readings.length} reading{readings.length !== 1 ? 's' : ''} saved</p>
          <div className="space-y-4">
            {readings.map(r => <ReadingCard key={r.id} reading={r} />)}
          </div>
        </>
      )}
    </main>
  )
}
