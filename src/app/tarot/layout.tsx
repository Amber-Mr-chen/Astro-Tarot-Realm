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
  return <>{children}</>
}
