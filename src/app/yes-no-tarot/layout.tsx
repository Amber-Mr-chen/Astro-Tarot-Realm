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
  return <>{children}</>
}
