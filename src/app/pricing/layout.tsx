import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pro Membership Plans | TarotRealm',
  description: 'Upgrade to TarotRealm Pro for unlimited tarot readings, deep readings, and full horoscope access.',
  alternates: { canonical: 'https://tarotrealm.xyz/pricing' },
  robots: { index: true, follow: true },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
