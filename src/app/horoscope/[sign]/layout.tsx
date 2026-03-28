import type { Metadata } from 'next'

const SIGN_META: Record<string, { name: string; dates: string; element: string }> = {
  aries:       { name: 'Aries',       dates: 'March 21 - April 19',    element: 'Fire'  },
  taurus:      { name: 'Taurus',      dates: 'April 20 - May 20',      element: 'Earth' },
  gemini:      { name: 'Gemini',      dates: 'May 21 - June 20',       element: 'Air'   },
  cancer:      { name: 'Cancer',      dates: 'June 21 - July 22',      element: 'Water' },
  leo:         { name: 'Leo',         dates: 'July 23 - August 22',    element: 'Fire'  },
  virgo:       { name: 'Virgo',       dates: 'August 23 - September 22', element: 'Earth' },
  libra:       { name: 'Libra',       dates: 'September 23 - October 22', element: 'Air' },
  scorpio:     { name: 'Scorpio',     dates: 'October 23 - November 21', element: 'Water' },
  sagittarius: { name: 'Sagittarius', dates: 'November 22 - December 21', element: 'Fire' },
  capricorn:   { name: 'Capricorn',   dates: 'December 22 - January 19', element: 'Earth' },
  aquarius:    { name: 'Aquarius',    dates: 'January 20 - February 18', element: 'Air'  },
  pisces:      { name: 'Pisces',      dates: 'February 19 - March 20', element: 'Water' },
}

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const { sign } = await params
  const data = SIGN_META[sign.toLowerCase()]
  if (!data) return { title: 'Daily Horoscope | TarotRealm' }

  const { name, dates, element } = data
  return {
    title: `${name} Horoscope Today — Free Daily ${name} Reading | TarotRealm`,
    description: `Read your free ${name} horoscope for today. ${name} (${dates}) is a ${element} sign. Get personalized insights on love, career, and money for ${name}.`,
    keywords: `${name.toLowerCase()} horoscope today, daily horoscope ${name.toLowerCase()}, ${name.toLowerCase()} astrology, ${name.toLowerCase()} reading today`,
    alternates: { canonical: `https://tarotrealm.xyz/horoscope/${sign.toLowerCase()}` },
    openGraph: {
      title: `${name} Horoscope Today | TarotRealm`,
      description: `Free daily ${name} horoscope for love, career, and money. Updated every day.`,
      url: `https://tarotrealm.xyz/horoscope/${sign.toLowerCase()}`,
    },
  }
}

export default function SignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
