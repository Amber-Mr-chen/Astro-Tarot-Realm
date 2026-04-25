import type { MetadataRoute } from 'next'

const BASE_URL = 'https://tarotrealm.xyz'

const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/tarot`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/yes-no-tarot`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/horoscope`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/birth-chart`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/compatibility`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]

  const signPages: MetadataRoute.Sitemap = ZODIAC_SIGNS.map((sign) => ({
    url: `${BASE_URL}/horoscope/${sign}`,
    lastModified,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticPages, ...signPages]
}
