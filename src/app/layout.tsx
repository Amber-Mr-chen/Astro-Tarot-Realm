import type { Metadata } from 'next'
import './globals.css'
import AuthProvider from './providers'
import BackButton from './back-button'
import AuthButton from './auth-button'
import StarCanvas from './star-canvas'
import MobileNav from './mobile-nav'
import FeedbackWidget from './feedback-widget'

export const metadata: Metadata = {
  title: 'Free Tarot Reading & Daily Horoscope | TarotRealm',
  description: 'Get your free tarot card reading and daily horoscope. Yes/No tarot, daily astrology for all 12 zodiac signs. Personalized readings in seconds.',
  keywords: 'free tarot reading, daily horoscope, yes no tarot, astrology, zodiac signs, tarot cards online',
  metadataBase: new URL('https://tarotrealm.xyz'),
  alternates: { canonical: 'https://tarotrealm.xyz' },
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Free Tarot Reading & Daily Horoscope | TarotRealm',
    description: 'Get your free tarot card reading and daily horoscope. Personalized astrology readings in seconds.',
    url: 'https://tarotrealm.xyz',
    siteName: 'TarotRealm',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TarotRealm - AI Tarot & Astrology' }],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TarotRealm',
    url: 'https://tarotrealm.xyz',
    description: 'Free tarot readings, daily horoscopes, birth charts, and zodiac compatibility.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://tarotrealm.xyz/horoscope/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-J4FWP2DRWD" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-J4FWP2DRWD');`
          }}
        />
        {/* Ahrefs Analytics */}
        <script async src="https://analytics.ahrefs.com/analytics.js" data-key="zgLcgdaoQctDwhSvzoEUgQ" />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: '#0D0D1A' }}>
        <StarCanvas />
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
                {/* Desktop nav links */}
                <div className="hidden md:flex gap-4 text-sm text-textSub">
                  <a href="/tarot" className="hover:text-gold transition-colors">Tarot</a>
                  <a href="/yes-no-tarot" className="hover:text-gold transition-colors">Yes/No</a>
                  <a href="/horoscope" className="hover:text-gold transition-colors">Horoscope</a>
                  <a href="/birth-chart" className="hover:text-gold transition-colors">Birth Chart</a>
                  <a href="/compatibility" className="hover:text-gold transition-colors">Compatibility</a>
                  <a href="/history" className="hover:text-gold transition-colors">History</a>
                  <a href="/pricing" className="hover:text-gold transition-colors" style={{ color: '#F39C12' }}>Pro ✨</a>
                </div>
                {/* Mobile hamburger menu */}
                <MobileNav />
                <AuthButton />
              </div>
            </div>
          </nav>
          {children}
          <FeedbackWidget />
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
