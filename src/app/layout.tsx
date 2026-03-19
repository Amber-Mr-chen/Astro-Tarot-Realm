import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Free AI Tarot Reading & Astrology | AstraTarot',
  description: 'Get your free AI-powered tarot card reading and daily horoscope. Personalized astrology readings in seconds. No signup required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#0D0D1A' }}>
        <nav className="border-b border-purple-900/30 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="font-cinzel text-xl font-bold text-gold tracking-widest">
              ✦ AstraTarot
            </a>
            <div className="flex gap-6 text-sm text-textSub">
              <a href="/tarot" className="hover:text-gold transition-colors">Tarot</a>
              <a href="/yes-no-tarot" className="hover:text-gold transition-colors">Yes/No</a>
              <a href="/horoscope" className="hover:text-gold transition-colors">Horoscope</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
