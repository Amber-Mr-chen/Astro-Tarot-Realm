'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

const FEATURES = [
  {
    icon: '🃏',
    title: 'Daily Tarot Reading',
    desc: 'Draw a card each day and receive a personalized reading to guide your journey through love, work, and life decisions.',
    href: '/tarot',
    cta: 'Draw a Card →',
  },
  {
    icon: '✨',
    title: 'Yes or No Tarot',
    desc: 'Ask any question and get an instant, honest answer from the cards. Perfect for decisions that keep you up at night.',
    href: '/yes-no-tarot',
    cta: 'Ask the Cards →',
  },
  {
    icon: '⭐',
    title: 'Daily Horoscope',
    desc: 'Get your daily love, career, and money forecast for all 12 zodiac signs. Rooted in real astrological tradition.',
    href: '/horoscope',
    cta: 'Read Today\'s Stars →',
  },
  {
    icon: '🌌',
    title: 'Birth Chart Reading',
    desc: 'Discover your Sun, Moon, and Rising signs from your birth date. Understand the cosmic blueprint that shapes who you are.',
    href: '/birth-chart',
    cta: 'Reveal My Chart →',
  },
  {
    icon: '💫',
    title: 'Zodiac Compatibility',
    desc: 'Explore the cosmic chemistry between any two signs. Love, friendship, and work compatibility grounded in real synastry.',
    href: '/compatibility',
    cta: 'Check Compatibility →',
  },
]

const STEPS = [
  { num: '01', title: 'Choose Your Reading', desc: 'Pick from tarot, horoscope, birth chart, or compatibility — all free to start.' },
  { num: '02', title: 'Enter Your Details', desc: 'Your zodiac sign, a question, or your birth date — whatever your chosen reading needs.' },
  { num: '03', title: 'Receive Your Insight', desc: 'Get a personalized reading grounded in astrological tradition. No fluff. No vague generalities.' },
]

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
    <main className="min-h-screen px-4 md:px-6">

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center py-8 md:py-12 max-w-3xl mx-auto">
        <div className="mb-3 text-gold text-xs tracking-[0.35em] uppercase font-cinzel">
          ✦ Mystical Divination ✦
        </div>
        <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-textMain mb-4 leading-tight">
          Your Free<br />
          <span style={{ color: '#9B59B6' }}>Tarot &amp; Astrology</span>
        </h1>
        <p className="text-textSub text-sm md:text-base max-w-lg mb-2">
          Tarot readings, horoscopes, birth charts, and compatibility — grounded in real astrological tradition. No signup required.
        </p>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-5xl mx-auto pb-20">
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-textMain mb-2">
          What Would You Like to Explore?
        </h2>
        <p className="text-textSub text-sm text-center mb-10">
          Five ways to connect with the wisdom of the stars
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <Link
              key={f.title}
              href={f.href}
              className="group rounded-2xl p-6 flex flex-col gap-3 transition-all hover:border-gold/60 hover:scale-[1.02]"
              style={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(155,89,182,0.2)' }}
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="font-cinzel text-base font-semibold text-textMain">{f.title}</h3>
              <p className="text-textSub text-sm leading-relaxed flex-1">{f.desc}</p>
              <span className="text-gold text-sm font-semibold group-hover:translate-x-1 transition-transform inline-block">
                {f.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-4xl mx-auto pb-20">
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-center text-textMain mb-2">
          How It Works
        </h2>
        <p className="text-textSub text-sm text-center mb-10">Three steps to your reading</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(s => (
            <div key={s.num} className="text-center px-4">
              <div className="font-cinzel text-4xl font-bold mb-3" style={{ color: 'rgba(201,168,76,0.4)' }}>
                {s.num}
              </div>
              <h3 className="font-cinzel text-base font-semibold text-gold mb-2">{s.title}</h3>
              <p className="text-textSub text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="max-w-3xl mx-auto pb-20 text-center">
        <div className="rounded-2xl px-8 py-8 border" style={{ backgroundColor: '#1A1A2E', borderColor: 'rgba(155,89,182,0.2)' }}>
          <div className="text-3xl mb-3">🔮</div>
          <p className="font-cinzel text-lg text-gold font-semibold mb-2">
            Rooted in Real Astrological Tradition
          </p>
          <p className="text-textSub text-sm leading-relaxed max-w-xl mx-auto">
            Every reading on TarotRealm draws from established astrological knowledge — elemental relationships, planetary rulerships, and classical card symbolism. Not random. Not generic. Grounded in the tradition that has guided seekers for centuries.
          </p>
        </div>
      </section>

      {/* ── Bottom note ── */}
      <section className="text-center pb-24">
        <p className="text-textSub text-xs">✦ All readings are free to try · Upgrade to Pro for unlimited access ✦</p>
      </section>

    </main>
  )
}
