import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Daily Horoscope for All 12 Zodiac Signs | TarotRealm',
  description: 'Read your free daily horoscope for love, career, and money. Personalized astrology readings for Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.',
  keywords: 'daily horoscope, free horoscope today, astrology reading, zodiac signs horoscope, love horoscope, career horoscope',
  alternates: { canonical: 'https://tarotrealm.xyz/horoscope' },
  openGraph: {
    title: 'Free Daily Horoscope for All 12 Zodiac Signs | TarotRealm',
    description: 'Read your free daily horoscope for love, career, and money. All 12 zodiac signs.',
    url: 'https://tarotrealm.xyz/horoscope',
  },
}

export default function HoroscopeLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Daily Horoscope — TarotRealm',
    url: 'https://tarotrealm.xyz/horoscope',
    applicationCategory: 'EntertainmentApplication',
    description: 'Read your free daily horoscope for love, career, and money. All 12 zodiac signs updated daily.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
