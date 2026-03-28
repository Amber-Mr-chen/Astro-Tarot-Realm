import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Birth Chart Reading — Sun, Moon & Rising Signs | TarotRealm',
  description: 'Discover your free birth chart. Enter your birth date and time to reveal your Sun sign, Moon sign, and Rising sign with a personalized astrological reading.',
  keywords: 'free birth chart, birth chart reading, sun moon rising signs, natal chart, astrology birth chart, free natal chart',
  alternates: { canonical: 'https://tarotrealm.xyz/birth-chart' },
  openGraph: {
    title: 'Free Birth Chart Reading | TarotRealm',
    description: 'Reveal your Sun, Moon, and Rising signs with a free personalized birth chart reading.',
    url: 'https://tarotrealm.xyz/birth-chart',
  },
}

export default function BirthChartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
