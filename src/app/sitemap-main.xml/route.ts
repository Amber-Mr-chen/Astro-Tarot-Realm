import { NextResponse } from 'next/server'

const BASE_URL = 'https://tarotrealm.xyz'
const LASTMOD = '2026-04-25'

const URLS = [
  '/',
  '/tarot',
  '/yes-no-tarot',
  '/horoscope',
  '/birth-chart',
  '/compatibility',
  '/pricing',
  '/terms',
  '/privacy',
  '/horoscope/aries',
  '/horoscope/taurus',
  '/horoscope/gemini',
  '/horoscope/cancer',
  '/horoscope/leo',
  '/horoscope/virgo',
  '/horoscope/libra',
  '/horoscope/scorpio',
  '/horoscope/sagittarius',
  '/horoscope/capricorn',
  '/horoscope/aquarius',
  '/horoscope/pisces',
]

export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${URLS.map((path) => `  <url>
    <loc>${BASE_URL}${path === '/' ? '/' : path}</loc>
    <lastmod>${LASTMOD}</lastmod>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Robots-Tag': 'all',
    },
  })
}
