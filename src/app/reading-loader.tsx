'use client'
import { useEffect, useState } from 'react'

const MESSAGES: Record<string, string[]> = {
  tarot: [
    'Consulting the ancient cards...',
    'Reading the cosmic energies...',
    'The cards are speaking...',
    'Interpreting the symbols...',
    'Channeling the wisdom within...',
  ],
  yesno: [
    'Seeking your answer...',
    'The oracle is listening...',
    'Reading the hidden energies...',
    'The cards reveal their truth...',
    'Consulting the mystic forces...',
  ],
  horoscope: [
    'Reading the stars...',
    'Consulting the celestial map...',
    'The planets are aligning...',
    'Decoding cosmic patterns...',
    'Listening to the universe...',
  ],
  birthchart: [
    'Mapping your cosmic blueprint...',
    'Calculating celestial positions...',
    'Reading your birth sky...',
    'Unlocking your star pattern...',
    'The universe remembers your first breath...',
  ],
  compatibility: [
    'Measuring cosmic chemistry...',
    'Comparing celestial energies...',
    'Reading the synastry...',
    'The stars are calculating...',
    'Consulting the cosmic record...',
  ],
}

interface ReadingLoaderProps {
  type?: keyof typeof MESSAGES
}

export default function ReadingLoader({ type = 'tarot' }: ReadingLoaderProps) {
  const messages = MESSAGES[type] ?? MESSAGES.tarot
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Orbiting stars */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full oracle-spin"
          style={{ border: '1px solid rgba(201,168,76,0.25)' }} />
        {/* Inner glow orb */}
        <div className="w-14 h-14 rounded-full oracle-glow flex items-center justify-center"
          style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, rgba(155,89,182,0.1) 100%)', border: '1px solid rgba(201,168,76,0.4)' }}>
          <span className="text-2xl oracle-pulse">✦</span>
        </div>
        {/* Orbiting dots */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full oracle-pulse"
            style={{
              backgroundColor: i % 2 === 0 ? '#C9A84C' : '#9B59B6',
              top: `${50 - 44 * Math.cos((deg * Math.PI) / 180)}%`,
              left: `${50 + 44 * Math.sin((deg * Math.PI) / 180)}%`,
              animationDelay: `${i * 0.36}s`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Rotating message */}
      <div className="h-6 relative overflow-hidden">
        <p
          key={msgIndex}
          className="text-textSub text-sm font-cinzel tracking-wide oracle-fade text-center"
        >
          {messages[msgIndex]}
        </p>
      </div>

      {/* Subtle progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full oracle-pulse"
            style={{ backgroundColor: '#C9A84C', animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </div>
    </div>
  )
}
