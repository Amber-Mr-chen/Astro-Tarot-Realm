import { NextRequest, NextResponse } from 'next/server'

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'
const CF_ACCOUNT_ID = 'ba1d688671ae99c51095e2ad24945f77'
const CF_D1_DB_ID = 'a7d11bd2-73e7-4ea1-870f-62af80838d74'

async function d1Query(sql: string, params: any[] = []) {
  const token = process.env.CF_D1_TOKEN
  if (!token) throw new Error('CF_D1_TOKEN not set')
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_D1_DB_ID}/query`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    }
  )
  const data = await res.json()
  if (!data.success) throw new Error(JSON.stringify(data.errors))
  return data.result
}

async function verifyWebhook(headers: Headers, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false

  const authAlgo = headers.get('paypal-auth-algo')
  const certUrl = headers.get('paypal-cert-url')
  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionSig = headers.get('paypal-transmission-sig')
  const transmissionTime = headers.get('paypal-transmission-time')

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false
  }

  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const auth = btoa(`${clientId}:${clientSecret}`)

  const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  const { access_token } = await tokenRes.json()

  const verifyRes = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  })

  const verifyData = await verifyRes.json()
  return verifyData.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const event = JSON.parse(body)

    // 验证 Webhook 签名（生产环境必须）
    const isValid = await verifyWebhook(req.headers, body)
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    console.log('[Webhook] Event:', event.event_type, event.id)

    // 处理退款事件，自动降级账户
    if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id
      if (orderId) {
        const result = await d1Query(
          'SELECT email FROM pending_orders WHERE order_id = ?',
          [orderId]
        )
        const order = result[0]?.results?.[0]
        if (order?.email) {
          await d1Query(
            'UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ?',
            ['free', null, order.email]
          )
          await d1Query(
            'UPDATE pending_orders SET status = ? WHERE order_id = ?',
            ['refunded', orderId]
          )
          console.log('[Webhook] User downgraded due to refund:', order.email)
        }
      }
      return NextResponse.json({ ok: true })
    }

    // 处理支付完成事件
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource?.supplementary_data?.related_ids?.order_id
      if (!orderId) {
        return NextResponse.json({ error: 'No order ID' }, { status: 400 })
      }

      // 查询 pending_orders
      const result = await d1Query(
        'SELECT email, plan, status FROM pending_orders WHERE order_id = ?',
        [orderId]
      )
      const order = result[0]?.results?.[0]

      if (!order || order.status === 'completed') {
        return NextResponse.json({ ok: true, note: 'already processed' })
      }

      // 升级用户
      const userResult = await d1Query(
        'SELECT plan, plan_expires_at FROM users WHERE email = ?',
        [order.email]
      )
      const currentUser = userResult[0]?.results?.[0]
      const currentExpiry = currentUser?.plan_expires_at || 0
      const isPro = currentUser?.plan === 'pro'

      const addDays = order.plan === 'monthly' ? 30 : 365
      const addMs = addDays * 24 * 60 * 60 * 1000
      const newExpiresAt = (isPro && currentExpiry > Date.now()) ? currentExpiry + addMs : Date.now() + addMs

      await d1Query(
        'UPDATE users SET plan = ?, plan_expires_at = ? WHERE email = ?',
        ['pro', newExpiresAt, order.email]
      )

      await d1Query(
        'UPDATE pending_orders SET status = ?, completed_at = ? WHERE order_id = ?',
        ['completed', Date.now(), orderId]
      )

      console.log('[Webhook] User upgraded:', order.email)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[Webhook] Error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
