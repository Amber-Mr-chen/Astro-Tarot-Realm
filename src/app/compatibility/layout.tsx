import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Zodiac Compatibility Test — Love & Friendship | TarotRealm',
  description: 'Discover the cosmic chemistry between any two zodiac signs. Free astrology compatibility test for love, friendship, and work. Grounded in traditional astrological synastry.',
  keywords: 'zodiac compatibility, horoscope compatibility, love compatibility astrology, star sign compatibility, synastry',
  alternates: { canonical: 'https://tarotrealm.xyz/compatibility' },
  openGraph: {
    title: 'Free Zodiac Compatibility Test | TarotRealm',
    description: 'Discover the cosmic chemistry between any two zodiac signs — love, friendship, and work compatibility.',
    url: 'https://tarotrealm.xyz/compatibility',
  },
}

export default function CompatibilityLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Zodiac Compatibility Test — TarotRealm',
    url: 'https://tarotrealm.xyz/compatibility',
    applicationCategory: 'EntertainmentApplication',
    description: 'Discover the cosmic chemistry between any two zodiac signs. Love, friendship, and work compatibility.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
