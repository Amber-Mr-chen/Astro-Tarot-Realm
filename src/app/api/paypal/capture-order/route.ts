import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getDB } from '@/lib/usage'

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

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET })
    if (!token?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderID, plan } = await req.json()
    const accessToken = await getAccessToken()

    const capture = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const captureData = await capture.json()

    if (captureData.status === 'COMPLETED') {
      const db = await getDB()
      console.log('[PayPal] Payment completed, DB:', !!db, 'Email:', token.email, 'Plan:', plan)
      
      if (!db) {
        console.error('[PayPal] DB not available, cannot upgrade user')
        return NextResponse.json({ error: 'Database unavailable' }, { status: 500 })
      }

      const expiresAt = plan === 'monthly' 
        ? Date.now() + 30 * 24 * 60 * 60 * 1000 
        : Date.now() + 365 * 24 * 60 * 60 * 1000

      const result = await db.prepare(
        'UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ?'
      ).bind('pro', expiresAt, token.email).run()

      console.log('[PayPal] User upgraded:', result)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
  } catch (e) {
    console.error('PayPal capture error:', e)
    return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 })
  }
}
