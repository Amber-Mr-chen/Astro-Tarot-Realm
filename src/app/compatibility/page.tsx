'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import ShareButton from '../share-button'

const SIGNS = [
  { name: 'Aries',       emoji: '🔥', dates: 'Mar 21 - Apr 19' },
  { name: 'Taurus',      emoji: '🌿', dates: 'Apr 20 - May 20' },
  { name: 'Gemini',      emoji: '🌬️', dates: 'May 21 - Jun 20' },
  { name: 'Cancer',      emoji: '🌊', dates: 'Jun 21 - Jul 22' },
  { name: 'Leo',         emoji: '☀️', dates: 'Jul 23 - Aug 22' },
  { name: 'Virgo',       emoji: '🌾', dates: 'Aug 23 - Sep 22' },
  { name: 'Libra',       emoji: '⚖️', dates: 'Sep 23 - Oct 22' },
  { name: 'Scorpio',     emoji: '🦂', dates: 'Oct 23 - Nov 21' },
  { name: 'Sagittarius', emoji: '🏹', dates: 'Nov 22 - Dec 21' },
  { name: 'Capricorn',   emoji: '🏔️', dates: 'Dec 22 - Jan 19' },
  { name: 'Aquarius',    emoji: '⚡', dates: 'Jan 20 - Feb 18' },
  { name: 'Pisces',      emoji: '🐠', dates: 'Feb 19 - Mar 20' },
]

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-textSub">{label}</span>
        <span className="font-semibold" style={{ color }}>{score}%</span>
      </div>
      <div className="h-2 bg-bg rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function StarRating({ score }: { score: number }) {
  const stars = Math.round(score / 20)
  return (
    <span className="text-gold">
      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
    </span>
  )
}

function SignSelector({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm text-textSub mb-2">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-bg border border-purple-900/40 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
      >
        <option value="">— Select a sign —</option>
        {SIGNS.map(s => (
          <option key={s.name} value={s.name}>{s.emoji} {s.name} ({s.dates})</option>
        ))}
      </select>
    </div>
  )
}

export default function CompatibilityPage() {
  const { data: session } = useSession()
  const [signA, setSignA] = useState('')
  const [signB, setSignB] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const signAInfo = SIGNS.find(s => s.name === signA)
  const signBInfo = SIGNS.find(s => s.name === signB)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!signA || !signB) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signA, signB }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }
      setResult(data)

      // Save to history if logged in
      if (session?.user?.email && data.reading) {
        fetch('/api/reading/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            type: 'compatibility',
            question: `${signA} + ${signB}`,
            result: JSON.stringify({ scores: data.scores, reading: data.reading }),
          }),
        }).catch(() => {})
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const overallScore = result?.scores?.overall ?? 0
  const overallColor = overallScore >= 80 ? '#C9A84C' : overallScore >= 65 ? '#A855F7' : '#6B7280'

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">💫</div>
        <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-gold mb-3">Zodiac Compatibility</h1>
        <p className="text-textSub text-sm md:text-base max-w-xl mx-auto">
          Discover the cosmic chemistry between two signs. Based on elemental harmony, planetary rulers, and traditional astrological synastry.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-purple-900/40 rounded-2xl p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <SignSelector label="Your Sign" value={signA} onChange={setSignA} />
          <SignSelector label="Their Sign" value={signB} onChange={setSignB} />
        </div>

        {/* Preview */}
        {signA && signB && (
          <div className="flex items-center justify-center gap-4 mb-6 py-3 bg-bg/50 rounded-xl">
            <span className="text-3xl">{signAInfo?.emoji}</span>
            <span className="text-textSub text-sm font-cinzel">{signA}</span>
            <span className="text-purple-400 text-xl">✦</span>
            <span className="text-textSub text-sm font-cinzel">{signB}</span>
            <span className="text-3xl">{signBInfo?.emoji}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !signA || !signB || signA === signB}
          className="w-full py-3 rounded-lg font-semibold text-bg transition-all disabled:opacity-50"
          style={{ background: loading ? '#555' : 'linear-gradient(135deg, #C9A84C, #E8C96D)' }}
        >
          {loading ? '✨ Reading the stars...' : '✨ Reveal Compatibility'}
        </button>
        {signA === signB && signA && (
          <p className="text-center text-xs text-purple-400 mt-2">Please select two different signs</p>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-center text-red-300 text-sm">
          {error}
          {error.includes('Sign in') && (
            <button onClick={() => signIn('google')} className="ml-3 text-gold underline">Sign in</button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Overall score hero */}
          <div className="bg-surface border border-purple-900/40 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">{signAInfo?.emoji}</span>
              <span className="font-cinzel text-lg text-textSub">{signA}</span>
              <span className="text-gold text-2xl">✦</span>
              <span className="font-cinzel text-lg text-textSub">{signB}</span>
              <span className="text-3xl">{signBInfo?.emoji}</span>
            </div>
            <div className="text-6xl font-bold mb-1" style={{ color: overallColor }}>
              {overallScore}%
            </div>
            <div className="text-textSub text-sm mb-5">Overall Compatibility</div>

            {/* Three score bars */}
            <div className="space-y-3 text-left max-w-xs mx-auto">
              <ScoreBar label="💕 Love & Romance" score={result.scores.love} color="#EC4899" />
              <ScoreBar label="👥 Friendship" score={result.scores.friendship} color="#A855F7" />
              <ScoreBar label="💼 Work & Collaboration" score={result.scores.work} color="#C9A84C" />
            </div>
          </div>

          {/* Reading sections */}
          <div className="bg-surface border border-purple-900/40 rounded-2xl p-6 md:p-8 space-y-5">
            <h2 className="font-cinzel text-xl text-gold text-center">Astrological Analysis</h2>

            {[
              { key: 'overall',   icon: '🌌', title: 'Overall Energy' },
              { key: 'strength',  icon: '✨', title: 'Greatest Strength' },
              { key: 'challenge', icon: '⚡', title: 'Key Challenge' },
              { key: 'love',      icon: '💕', title: 'Love Compatibility' },
              { key: 'work',      icon: '💼', title: 'Work Compatibility' },
              { key: 'advice',    icon: '🔮', title: 'Astrological Guidance' },
            ].filter(s => result.reading[s.key]).map(({ key, icon, title }) => (
              <div key={key} className="border-t border-purple-900/30 pt-4 first:border-0 first:pt-0">
                <h3 className="text-gold font-semibold mb-2">{icon} {title}</h3>
                <p className="text-textMain text-sm leading-relaxed">{String(result.reading[key])}</p>
              </div>
            ))}
          </div>

          {/* Pro upsell for free users */}
          {result.plan !== 'pro' && (
            <div className="bg-purple-900/20 border border-gold/30 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-gold font-semibold mb-1">Unlock Full Compatibility Report</p>
              <p className="text-textSub text-sm mb-3">
                Pro members get the complete reading — love depth, conflict analysis, work compatibility, and personal guidance for this pairing.
              </p>
              <Link href="/pricing" className="inline-block px-5 py-2 rounded-lg text-sm font-semibold text-bg" style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96D)' }}>
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Try another */}
          <div className="flex flex-col items-center gap-3">
            <ShareButton text={`I just checked my ${signA} × ${signB} compatibility on TarotRealm 💫\n\n💕 Love: ${result.scores.love}%  👥 Friendship: ${result.scores.friendship}%  💼 Work: ${result.scores.work}%\nOverall: ${result.scores.overall}%\n\nCheck yours free → tarotrealm.xyz/compatibility`} />
            <button
              onClick={() => { setResult(null); setSignA(''); setSignB('') }}
              className="text-sm text-purple-400 hover:text-gold transition-colors underline"
            >
              Try another pairing →
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
