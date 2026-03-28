import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yes or No Tarot Reading — Free Instant Answer | TarotRealm',
  description: 'Get an instant Yes or No answer from the tarot cards. Free yes no tarot reading for love, decisions, and life questions. Honest guidance in seconds.',
  keywords: 'yes no tarot, yes or no tarot reading, tarot yes no free, tarot oracle, instant tarot answer',
  alternates: { canonical: 'https://tarotrealm.xyz/yes-no-tarot' },
  openGraph: {
    title: 'Yes or No Tarot Reading — Free Instant Answer | TarotRealm',
    description: 'Get an instant Yes or No answer from the tarot cards. Free reading for love, decisions, and life questions.',
    url: 'https://tarotrealm.xyz/yes-no-tarot',
  },
}

export default function YesNoLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Yes or No Tarot Reading — TarotRealm',
    url: 'https://tarotrealm.xyz/yes-no-tarot',
    applicationCategory: 'EntertainmentApplication',
    description: 'Get an instant Yes or No answer from the tarot cards. Free reading for love, decisions, and life questions.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  )
}
