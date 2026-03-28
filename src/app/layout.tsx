import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from './providers'
import BackButton from './back-button'
import AuthButton from './auth-button'

export const metadata: Metadata = {
  title: 'Free Tarot Reading & Daily Horoscope | TarotRealm',
  description: 'Get your free tarot card reading and daily horoscope. Yes/No tarot, daily astrology for all 12 zodiac signs. Personalized readings in seconds.',
  keywords: 'free tarot reading, daily horoscope, yes no tarot, astrology, zodiac signs, tarot cards online',
  metadataBase: new URL('https://tarotrealm.xyz'),
  alternates: { canonical: 'https://tarotrealm.xyz' },
  openGraph: {
    title: 'Free Tarot Reading & Daily Horoscope | TarotRealm',
    description: 'Get your free tarot card reading and daily horoscope. Personalized astrology readings in seconds.',
    url: 'https://tarotrealm.xyz',
    siteName: 'TarotRealm',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: '#0D0D1A' }}>
        <AuthProvider>
          <nav className="border-b border-purple-900/30 px-4 md:px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BackButton />
                <a href="/" className="font-cinzel text-lg md:text-xl font-bold text-gold tracking-widest">
                  ✦ TarotRealm
                </a>
              </div>
              <div className="flex items-center gap-3 md:gap-5">
                <div className="flex gap-3 md:gap-4 text-xs md:text-sm text-textSub">
                  <a href="/tarot" className="hover:text-gold transition-colors">Tarot</a>
                  <a href="/yes-no-tarot" className="hover:text-gold transition-colors hidden sm:inline">Yes/No</a>
                  <a href="/horoscope" className="hover:text-gold transition-colors hidden sm:inline">Horoscope</a>
                  <a href="/birth-chart" className="hover:text-gold transition-colors hidden md:inline">Birth Chart</a>
                  <a href="/compatibility" className="hover:text-gold transition-colors hidden md:inline">Compatibility</a>
                  <a href="/history" className="hover:text-gold transition-colors hidden md:inline">History</a>
                  <a href="/pricing" className="hover:text-gold transition-colors" style={{ color: '#F39C12' }}>Pro ✨</a>
                </div>
                <AuthButton />
              </div>
            </div>
          </nav>
          {children}
          <footer className="border-t border-purple-900/30 mt-16 py-8 px-6">
            <div className="max-w-6xl mx-auto text-center text-textSub text-sm space-y-3">
              <div className="flex justify-center gap-6">
                <a href="/terms" className="hover:text-gold transition-colors">Terms of Service</a>
                <a href="/privacy" className="hover:text-gold transition-colors">Privacy Policy</a>
                <a href="mailto:support@tarotrealm.xyz" className="hover:text-gold transition-colors">Contact</a>
              </div>
              <p className="text-xs">© 2026 TarotRealm. For entertainment purposes only.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
