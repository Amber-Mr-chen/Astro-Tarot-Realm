import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const RESEND_API = 'https://api.resend.com/emails'
const OWNER_EMAIL = 'wanglilong616@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    const userEmail = token?.email as string | null

    const { rating, comment } = await req.json()
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
    const page = req.headers.get('referer') ?? 'unknown'
    const subject = `TarotRealm Feedback: ${stars} (${rating}/5)`

    const html = `
<div style="font-family: Georgia, serif; padding: 24px; max-width: 480px;">
  <h2 style="color: #C9A84C;">New Feedback Received</h2>
  <p><strong>Rating:</strong> ${stars} ${rating}/5</p>
  <p><strong>From:</strong> ${userEmail ?? 'Guest (not signed in)'}</p>
  <p><strong>Page:</strong> ${page}</p>
  ${comment ? `<p><strong>Comment:</strong></p><blockquote style="border-left:3px solid #C9A84C;padding-left:12px;color:#555;">${comment}</blockquote>` : '<p><em>No comment provided.</em></p>'}
</div>`

    // Get RESEND_API_KEY from Cloudflare env
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const ctx = await getCloudflareContext({ async: true })
    const apiKey = (ctx.env as any).RESEND_API_KEY

    if (apiKey) {
      await fetch(RESEND_API, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'TarotRealm Feedback <noreply@tarotrealm.xyz>',
          to: OWNER_EMAIL,
          subject,
          html,
          text: `Rating: ${rating}/5\nFrom: ${userEmail ?? 'Guest'}\nPage: ${page}\nComment: ${comment ?? 'None'}`,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[feedback]', e?.message)
    return NextResponse.json({ ok: true }) // Silent failure — don't show error to user
  }
}
