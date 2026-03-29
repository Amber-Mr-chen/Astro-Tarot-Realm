'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import ShareButton from '../share-button'

// Sun sign calculation by birth date
function getSunSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius'
  return 'Pisces'
}

// Approximate moon sign by cycling through signs every ~2.5 days
function getMoonSign(year: number, month: number, day: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
  const baseDate = new Date(2000, 0, 6) // known new moon in Capricorn
  const inputDate = new Date(year, month - 1, day)
  const diffDays = Math.floor((inputDate.getTime() - baseDate.getTime()) / 86400000)
  const moonCycle = ((diffDays % 354) + 354) % 354
  const signIndex = Math.floor(moonCycle / 29.5 * 12) % 12
  return signs[signIndex]
}

// Approximate rising sign by birth hour
function getRisingSign(sunSign: string, hour: number): string {
  const signs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
  const sunIndex = signs.indexOf(sunSign)
  const offset = Math.floor(hour / 2)
  return signs[(sunIndex + offset) % 12]
}

const SIGN_INFO: Record<string, { emoji: string; element: string; ruler: string; symbol: string; color: string }> = {
  Aries:       { emoji: '🔥', element: 'Fire',  ruler: 'Mars',    symbol: '♈', color: '#FF4444' },
  Taurus:      { emoji: '🌿', element: 'Earth', ruler: 'Venus',   symbol: '♉', color: '#66BB6A' },
  Gemini:      { emoji: '🌬️', element: 'Air',   ruler: 'Mercury', symbol: '♊', color: '#FFD54F' },
  Cancer:      { emoji: '🌊', element: 'Water', ruler: 'Moon',    symbol: '♋', color: '#4FC3F7' },
  Leo:         { emoji: '☀️', element: 'Fire',  ruler: 'Sun',     symbol: '♌', color: '#FFA726' },
  Virgo:       { emoji: '🌾', element: 'Earth', ruler: 'Mercury', symbol: '♍', color: '#A5D6A7' },
  Libra:       { emoji: '⚖️', element: 'Air',   ruler: 'Venus',   symbol: '♎', color: '#CE93D8' },
  Scorpio:     { emoji: '🦂', element: 'Water', ruler: 'Pluto',   symbol: '♏', color: '#B71C1C' },
  Sagittarius: { emoji: '🏹', element: 'Fire',  ruler: 'Jupiter', symbol: '♐', color: '#FF7043' },
  Capricorn:   { emoji: '🏔️', element: 'Earth', ruler: 'Saturn',  symbol: '♑', color: '#78909C' },
  Aquarius:    { emoji: '⚡', element: 'Air',   ruler: 'Uranus',  symbol: '♒', color: '#29B6F6' },
  Pisces:      { emoji: '🐠', element: 'Water', ruler: 'Neptune', symbol: '♓', color: '#7986CB' },
}

export default function BirthChartPage() {
  const { data: session } = useSession()
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!birthDate) return

    setLoading(true)
    setError('')
    setResult(null)

    const [year, month, day] = birthDate.split('-').map(Number)
    const hour = birthTime ? parseInt(birthTime.split(':')[0]) : 12

    const sunSign = getSunSign(month, day)
    const moonSign = getMoonSign(year, month, day)
    const risingSign = birthTime ? getRisingSign(sunSign, hour) : null

    try {
      const res = await fetch('/api/birth-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sunSign, moonSign, risingSign, birthDate, birthTime }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Something went wrong')
        return
      }
      const fullResult = { ...data, sunSign, moonSign, risingSign }
      setResult(fullResult)

      // Save to history if logged in
      if (session?.user?.email && data.reading) {
        fetch('/api/reading/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            type: 'birth-chart',
            question: [sunSign, moonSign, risingSign].filter(Boolean).join(' + '),
            result: JSON.stringify(data.reading),
          }),
        }).catch(() => {})
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🌌</div>
        <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-gold mb-3">Birth Chart Reading</h1>
        <p className="text-textSub text-sm md:text-base max-w-xl mx-auto">
          Discover your cosmic blueprint. Enter your birth details to reveal your Sun, Moon, and Rising signs — the three pillars of your astrological identity.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-purple-900/40 rounded-2xl p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm text-textSub mb-2">Date of Birth <span className="text-gold">*</span></label>
            <input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              required
              className="w-full bg-bg border border-purple-900/40 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-textSub mb-2">
              Time of Birth <span className="text-xs text-purple-400">(optional — unlocks Rising sign)</span>
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
              className="w-full bg-bg border border-purple-900/40 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !birthDate}
          className="mt-6 w-full py-3 rounded-lg font-semibold text-bg transition-all disabled:opacity-50"
          style={{ background: loading ? '#555' : 'linear-gradient(135deg, #C9A84C, #E8C96D)' }}
        >
          {loading ? '✨ Reading the stars...' : '✨ Reveal My Birth Chart'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6 text-center text-red-300 text-sm">
          {error}
          {error.includes('sign in') && (
            <button onClick={() => signIn('google')} className="ml-3 text-gold underline">Sign in</button>
          )}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Three signs overview */}
          <div className={`grid gap-4 ${result.risingSign ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {[
              { label: 'Sun Sign ☀️', sign: result.sunSign, desc: 'Your core identity' },
              { label: 'Moon Sign 🌙', sign: result.moonSign, desc: 'Your emotional self' },
              ...(result.risingSign ? [{ label: 'Rising Sign ⬆️', sign: result.risingSign, desc: 'How others see you' }] : []),
            ].map(({ label, sign, desc }) => {
              const info = SIGN_INFO[sign]
              return (
                <div key={label} className="bg-surface border border-purple-900/40 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{info?.emoji}</div>
                  <div className="text-xs text-textSub mb-1">{label}</div>
                  <div className="font-cinzel font-bold text-gold text-lg">{sign}</div>
                  <div className="text-xs text-purple-400 mt-1">{info?.element} · {info?.ruler}</div>
                  <div className="text-xs text-textSub mt-1">{desc}</div>
                </div>
              )
            })}
          </div>

          {/* No birth time note */}
          {!result.risingSign && (
            <p className="text-center text-xs text-purple-400">
              Add your birth time above to unlock your Rising sign
            </p>
          )}

          {/* Reading */}
          {result.reading && (
            <div className="bg-surface border border-purple-900/40 rounded-2xl p-6 md:p-8 space-y-5">
              <h2 className="font-cinzel text-xl text-gold text-center">Your Cosmic Reading</h2>
              {[
                { key: 'identity',  icon: '☀️', title: 'Core Identity' },
                { key: 'emotion',   icon: '🌙', title: 'Emotional World' },
                { key: 'rising',    icon: '⬆️', title: 'Your Rising Energy' },
                { key: 'purpose',   icon: '🌟', title: 'Life Purpose' },
                { key: 'challenge', icon: '⚡', title: 'Growth & Challenge' },
                { key: 'advice',    icon: '🔮', title: 'Cosmic Guidance' },
              ].filter(s => result.reading[s.key]).map(({ key, icon, title }) => (
                <div key={key} className="border-t border-purple-900/30 pt-4 first:border-0 first:pt-0">
                  <h3 className="text-gold font-semibold mb-2">{icon} {title}</h3>
                  <p className="text-textMain text-sm leading-relaxed">{String(result.reading[key])}</p>
                </div>
              ))}
            </div>
          )}

          {/* Upsell for non-pro */}
          {result.plan !== 'pro' && (
            <div className="bg-purple-900/20 border border-gold/30 rounded-xl p-5 text-center">
              <div className="text-2xl mb-2">✨</div>
              <p className="text-gold font-semibold mb-1">Unlock Deep Birth Chart Analysis</p>
              <p className="text-textSub text-sm mb-3">Pro members get an extended reading with relationship compatibility, career path, and yearly forecast.</p>
              <Link href="/pricing" className="inline-block px-5 py-2 rounded-lg text-sm font-semibold text-bg" style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96D)' }}>
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Share */}
          <div className="flex justify-center">
            <ShareButton text={`I just discovered my birth chart on TarotRealm ✨\n\n☀️ Sun: ${result.sunSign}  🌙 Moon: ${result.moonSign}${result.risingSign ? `  ⬆️ Rising: ${result.risingSign}` : ''}\n\nDiscover yours free → tarotrealm.xyz/birth-chart`} />
          </div>
        </div>
      )}
    </main>
  )
}
