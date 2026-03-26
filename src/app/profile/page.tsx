'use client'
import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type UserStats = {
  plan: string
  credits: number
  plan_expires_at: number | null
  created_at: number
  total_readings: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user/stats?email=${encodeURIComponent(session.user.email)}`)
        .then(r => r.json())
        .then(data => {
          setStats(data)
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
        <div className="text-5xl mb-6">👤</div>
        <h1 className="font-cinzel text-3xl font-bold text-textMain mb-4">Your Profile</h1>
        <p className="text-textSub mb-8">Sign in to view your profile and stats.</p>
        <button onClick={() => signIn('google')}
          className="px-8 py-4 rounded-full font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
          Sign In with Google
        </button>
      </main>
    )
  }

  const isPro = stats?.plan === 'pro'
  const planExpiry = stats?.plan_expires_at ? new Date(stats.plan_expires_at).toLocaleDateString() : null

  return (
    <main className="min-h-screen px-6 py-16 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <div className="text-gold text-sm tracking-[0.3em] uppercase font-cinzel mb-4">✦ Your Account ✦</div>
        <h1 className="font-cinzel text-4xl font-bold text-textMain">Profile</h1>
      </div>

      {/* User Info */}
      <div className="rounded-2xl p-6 mb-6 flex items-center gap-5"
        style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        {session.user?.image && (
          <img src={session.user.image} alt="avatar" className="w-16 h-16 rounded-full" />
        )}
        <div>
          <h2 className="font-cinzel text-xl font-bold text-textMain">{session.user?.name}</h2>
          <p className="text-textSub text-sm">{session.user?.email}</p>
          <p className="text-textSub text-xs mt-1">
            Member since {stats?.created_at ? new Date(stats.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Plan Status */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: '#1A1A2E', border: `1px solid ${isPro ? '#F39C12' : 'rgba(155,89,182,0.3)'}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinzel font-semibold text-textMain">Current Plan</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPro ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'}`}>
            {isPro ? '💎 PRO' : '🆓 FREE'}
          </span>
        </div>
        {isPro ? (
          <p className="text-textSub text-sm">{planExpiry ? `Expires: ${planExpiry}` : 'Active subscription'}</p>
        ) : (
          <div>
            <p className="text-textSub text-sm mb-4">3 free readings per day. Upgrade for unlimited access.</p>
            <Link href="/pricing"
              className="inline-block px-6 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #F39C12, #E67E22)' }}>
              Upgrade to Pro →
            </Link>
          </div>
        )}
      </div>

      {/* Credits */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-cinzel font-semibold text-textMain mb-1">Credits</h3>
            <p className="text-textSub text-sm">Use credits for extra readings beyond your daily limit</p>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-3xl font-bold text-gold">{stats?.credits || 0}</div>
            <div className="text-textSub text-xs">available</div>
          </div>
        </div>
        <Link href="/pricing"
          className="inline-block mt-4 px-6 py-2 rounded-full text-sm font-semibold border"
          style={{ borderColor: '#9B59B6', color: '#9B59B6' }}>
          Buy Credits →
        </Link>
      </div>

      {/* Stats */}
      <div className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)' }}>
        <h3 className="font-cinzel font-semibold text-textMain mb-4">Your Journey</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="font-cinzel text-3xl font-bold text-gold">{stats?.total_readings || 0}</div>
            <div className="text-textSub text-xs mt-1">Total Readings</div>
          </div>
          <div className="text-center">
            <div className="font-cinzel text-3xl font-bold" style={{ color: '#9B59B6' }}>
              {isPro ? '∞' : '3'}
            </div>
            <div className="text-textSub text-xs mt-1">Daily Limit</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="flex gap-3">
        <Link href="/history"
          className="flex-1 py-3 rounded-full text-sm font-semibold text-center transition-all hover:opacity-80"
          style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.3)', color: '#9B59B6' }}>
          View History
        </Link>
        <Link href="/pricing"
          className="flex-1 py-3 rounded-full text-sm font-semibold text-center text-white transition-all hover:opacity-80"
          style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
          Upgrade Plan
        </Link>
      </div>
    </main>
  )
}
