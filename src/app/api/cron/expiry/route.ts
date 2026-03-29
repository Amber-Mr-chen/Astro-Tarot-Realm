import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const RESEND_API = 'https://api.resend.com/emails'
const FROM_EMAIL = 'TarotRealm <noreply@tarotrealm.xyz>'
const PRICING_URL = 'https://tarotrealm.xyz/pricing'
const ADMIN_EMAIL = 'wanglilong616@gmail.com'
// Security token to prevent unauthorized calls
const CRON_SECRET = process.env.CRON_SECRET || 'tarotrealm-cron-2026'

async function sendReminderEmail(apiKey: string, to: string, name: string, daysLeft: number): Promise<boolean> {
  const subject = daysLeft <= 1
    ? '⚠️ Your TarotRealm Pro membership expires tomorrow'
    : `🔮 Your TarotRealm Pro membership expires in ${daysLeft} days`

  const firstName = name?.split(' ')[0] ?? 'there'

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Georgia, serif; background: #0D0D1A; color: #E8E0FF; padding: 40px 20px; max-width: 520px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #C9A84C; font-size: 24px; margin: 0;">✦ TarotRealm</h1>
  </div>
  <div style="background: #1A1A2E; border: 1px solid rgba(155,89,182,0.3); border-radius: 16px; padding: 32px;">
    <p style="color: #E8E0FF; margin-top: 0;">Hi ${firstName},</p>
    <p style="color: #E8E0FF;">Your TarotRealm Pro membership is expiring <strong style="color: #F39C12;">${daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`}</strong>.</p>
    <p style="color: #A89BC0; font-size: 14px;">As a Pro member, you've enjoyed:</p>
    <ul style="color: #A89BC0; font-size: 14px; line-height: 1.8;">
      <li>Unlimited daily tarot readings</li>
      <li>Deep readings with extended insights</li>
      <li>Full horoscope with 6 detailed sections</li>
      <li>Birth chart and compatibility readings</li>
    </ul>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${PRICING_URL}" style="background: linear-gradient(135deg, #C9A84C, #E8C96D); color: #0D0D1A; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px;">
        ✨ Renew My Membership
      </a>
    </div>
    <p style="color: #A89BC0; font-size: 13px; margin-bottom: 0;">Questions? Reply to this email and we'll help.</p>
  </div>
  <p style="color: #6B5E8A; font-size: 12px; text-align: center; margin-top: 24px;">
    © 2026 TarotRealm · <a href="https://tarotrealm.xyz/privacy" style="color: #6B5E8A;">Privacy Policy</a>
  </p>
</body>
</html>`

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text: `Hi ${firstName}, your TarotRealm Pro membership expires ${daysLeft <= 1 ? 'tomorrow' : `in ${daysLeft} days`}. Renew at ${PRICING_URL}`,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  // Verify secret token
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx.env as any).DB
    const apiKey = (ctx.env as any).RESEND_API_KEY

    if (!db || !apiKey) {
      return NextResponse.json({ error: 'Missing DB or RESEND_API_KEY' }, { status: 500 })
    }

    const now = Date.now()
    const in3days = now + 3 * 24 * 60 * 60 * 1000

    // Find Pro users expiring within 3 days, not yet reminded
    const { results } = await db.prepare(`
      SELECT email, name, plan_expires_at
      FROM users
      WHERE plan = 'pro'
        AND plan_expires_at > ?
        AND plan_expires_at < ?
        AND (expiry_reminder_sent IS NULL OR expiry_reminder_sent = 0)
        AND email IS NOT NULL
    `).bind(now, in3days).all() as {
      results: Array<{ email: string; name: string; plan_expires_at: number }>
    }

    let sent = 0
    let failed = 0

    for (const user of results) {
      if (user.email === ADMIN_EMAIL) continue

      const daysLeft = Math.max(1, Math.ceil((user.plan_expires_at - now) / 86400000))
      const ok = await sendReminderEmail(apiKey, user.email, user.name ?? '', daysLeft)

      if (ok) {
        await db.prepare('UPDATE users SET expiry_reminder_sent = 1 WHERE email = ?')
          .bind(user.email).run()
        sent++
      } else {
        failed++
      }
    }

    return NextResponse.json({ ok: true, checked: results.length, sent, failed })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
