'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function Home() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: (session.user as any).id || session.user.email,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      }).catch(() => {})
    }
  }, [session])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
      {/* Hero */}
      <div className="mb-4 text-gold text-sm tracking-[0.3em] uppercase font-cinzel">
        ✦ AI-Powered Divination ✦
      </div>
      <h1 className="font-cinzel text-5xl md:text-7xl font-bold text-textMain mb-6 leading-tight">
        Your Free AI<br />
        <span style={{ color: '#9B59B6' }}>Tarot & Astrology</span>
      </h1>
      <p className="text-textSub text-lg max-w-xl mb-12">
        Personalized tarot readings and daily horoscopes powered by AI.
        No signup required. Discover what the universe has in store for you.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link href="/tarot"
          className="px-8 py-4 rounded-full font-semibold text-white transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #9B59B6, #6C3483)' }}>
          🃏 Daily Tarot Reading
        </Link>
        <Link href="/yes-no-tarot"
          className="px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 border"
          style={{ borderColor: '#F39C12', color: '#F39C12' }}>
          ✨ Yes or No Tarot
        </Link>
        <Link href="/horoscope"
          className="px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 border"
          style={{ borderColor: '#9B59B6', color: '#9B59B6' }}>
          ⭐ Daily Horoscope
        </Link>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {[
          { icon: '🃏', title: 'Daily Tarot', desc: 'Draw a card each day and receive a personalized AI reading to guide your journey.' },
          { icon: '✨', title: 'Yes or No', desc: 'Ask any question and get an instant answer from the cards with detailed guidance.' },
          { icon: '♈', title: 'Horoscope', desc: 'Get your daily love, career, and money forecast based on your zodiac sign.' },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl p-6 text-left"
            style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}>
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-cinzel text-lg font-semibold text-textMain mb-2">{f.title}</h3>
            <p className="text-textSub text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
