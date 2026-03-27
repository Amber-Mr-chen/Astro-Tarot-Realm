import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'

// Cloudflare D1 REST API - works without getCloudflareContext
const CF_ACCOUNT_ID = 'ba1d688671ae99c51095e2ad24945f77'
const CF_D1_DB_ID = 'a7d11bd2-73e7-4ea1-870f-62af80838d74'

async function d1Query(sql: string, params: any[] = []) {
  const token = process.env.CF_D1_TOKEN
  if (!token) throw new Error('CF_D1_TOKEN not set')

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DB_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    }
  )
  const data = await res.json()
  if (!data.success) throw new Error(JSON.stringify(data.errors))
  return data.result
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const auth = btoa(`${clientId}:${clientSecret}`)
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
      // 先查询当前用户的到期时间
      const userResult = await d1Query(
        'SELECT plan, plan_expires_at FROM users WHERE email = ?',
        [token.email]
      )
      
      const currentUser = userResult[0]?.results?.[0]
      const currentExpiry = currentUser?.plan_expires_at || 0
      const isPro = currentUser?.plan === 'pro'
      
      // 计算新的到期时间
      const addDays = plan === 'monthly' ? 30 : 365
      const addMs = addDays * 24 * 60 * 60 * 1000
      
      let newExpiresAt
      if (isPro && currentExpiry > Date.now()) {
        // 已经是Pro且未过期，从原到期时间叠加
        newExpiresAt = currentExpiry + addMs
      } else {
        // Free用户或已过期，从现在开始算
        newExpiresAt = Date.now() + addMs
      }

      await d1Query(
        'UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ?',
        ['pro', newExpiresAt, token.email]
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
  } catch (e) {
    console.error('[PayPal] Error:', e)
    return NextResponse.json({ error: 'Failed', detail: String(e) }, { status: 500 })
  }
}
