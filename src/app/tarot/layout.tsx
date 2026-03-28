import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Tarot Card Reading Online | TarotRealm',
  description: 'Draw a free tarot card and get an instant personalized reading. Daily tarot readings for love, career, and life guidance. No signup required.',
  keywords: 'free tarot reading, tarot card reading online, daily tarot, tarot cards, free tarot',
  alternates: { canonical: 'https://tarotrealm.xyz/tarot' },
  openGraph: {
    title: 'Free Tarot Card Reading Online | TarotRealm',
    description: 'Draw a free tarot card and get an instant personalized reading for love, career, and life.',
    url: 'https://tarotrealm.xyz/tarot',
  },
}

export default function TarotLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Free Tarot Card Reading — TarotRealm',
    url: 'https://tarotrealm.xyz/tarot',
    applicationCategory: 'EntertainmentApplication',
    description: 'Draw a free tarot card and get an instant personalized reading for love, career, and life guidance.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
