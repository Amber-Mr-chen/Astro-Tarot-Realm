import { NextResponse } from 'next/server'

const BASE_URL = 'https://tarotrealm.xyz'

const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  const staticPages = [
    { url: '/',           priority: '1.0', changefreq: 'daily' },
    { url: '/tarot',      priority: '0.9', changefreq: 'daily' },
    { url: '/yes-no-tarot', priority: '0.9', changefreq: 'daily' },
    { url: '/horoscope',  priority: '0.9', changefreq: 'daily' },
    { url: '/pricing',    priority: '0.7', changefreq: 'monthly' },
    { url: '/terms',      priority: '0.3', changefreq: 'monthly' },
    { url: '/privacy',    priority: '0.3', changefreq: 'monthly' },
  ]

  const signPages = ZODIAC_SIGNS.map(sign => ({
    url: `/horoscope/${sign}`,
    priority: '0.8',
    changefreq: 'daily',
  }))

  const allPages = [...staticPages, ...signPages]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
