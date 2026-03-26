import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64')
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

async function getDB() {
  // Try sync first (production worker context)
  try {
    const ctx = getCloudflareContext()
    const db = (ctx?.env as any)?.DB
    if (db) { console.log('[PayPal] Got DB via sync'); return db }
  } catch {}
  // Try async
  try {
    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx?.env as any)?.DB
    if (db) { console.log('[PayPal] Got DB via async'); return db }
  } catch {}
  console.error('[PayPal] DB binding not found')
  return null
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderID, plan } = await req.json()
    console.log('[PayPal] Capturing order:', orderID, 'plan:', plan, 'email:', token.email)

    const accessToken = await getAccessToken()

    const capture = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await capture.json()
    console.log('[PayPal] Capture status:', captureData.status)

    if (captureData.status === 'COMPLETED') {
      const db = await getDB()

      if (!db) {
        return NextResponse.json({ error: 'Database unavailable, please contact support' }, { status: 500 })
      }

      const expiresAt = plan === 'monthly'
        ? Date.now() + 30 * 24 * 60 * 60 * 1000
        : Date.now() + 365 * 24 * 60 * 60 * 1000

      const result = await db.prepare(
        'UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ?'
      ).bind('pro', expiresAt, token.email).run()

      console.log('[PayPal] DB update result:', JSON.stringify(result))
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Payment not completed', status: captureData.status }, { status: 400 })
  } catch (e) {
    console.error('[PayPal] Capture error:', e)
    return NextResponse.json({ error: 'Failed to capture payment', detail: String(e) }, { status: 500 })
  }
}
