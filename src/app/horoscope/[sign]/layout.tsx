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

export default async function SignLayout({ children, params }: { children: React.ReactNode; params: Promise<{ sign: string }> }) {
  const { sign } = await params
  const data = SIGN_META[sign.toLowerCase()]
  if (!data) return <>{children}</>

  const { name, dates, element } = data
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the ${name} horoscope for today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${name} (${dates}) is a ${element} sign. Get your free daily ${name} horoscope on TarotRealm for love, career, and money insights updated every day.`,
        },
      },
      {
        '@type': 'Question',
        name: `What element is ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${name} is a ${element} sign, born between ${dates}.`,
        },
      },
    ],
  }

  // Breadcrumb + Article schema for richer SERP
  const slug = sign.toLowerCase()
  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Horoscope', item: 'https://tarotrealm.xyz/horoscope' },
          { '@type': 'ListItem', position: 2, name: name }
        ]
      },
      {
        '@type': 'Article',
        '@id': `https://tarotrealm.xyz/horoscope/${slug}#article`,
        mainEntityOfPage: `https://tarotrealm.xyz/horoscope/${slug}`,
        headline: `${name} Zodiac Sign: Traits, Compatibility, Love & Career Guidance`,
        description: `Discover the ${name} zodiac sign (${dates}): ${element.toLowerCase()} traits, love and compatibility, career strengths, and practical guidance. Explore your daily horoscope and tarot insights.`,
        image: `https://tarotrealm.xyz/og-image.png`,
        dateModified: new Date().toISOString(),
        author: { '@type': 'Organization', name: 'TarotRealm' },
        publisher: { '@type': 'Organization', name: 'TarotRealm', logo: { '@type': 'ImageObject', url: 'https://tarotrealm.xyz/logo.png' } },
        articleSection: ['Personality', 'Love & Relationships', 'Career & Money', 'Health & Wellness', 'Tarot for Sign', 'Compatibility']
      }
    ]
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      {children}
    </>
  )
}
