import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

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

    const { plan } = await req.json()
    const amount = plan === 'monthly' ? '3.99' : '29.99'
    const description = plan === 'monthly' ? 'Pro Monthly Subscription' : 'Pro Yearly Subscription'

    const accessToken = await getAccessToken()

    const order = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          description,
        }],
      }),
    })

    const orderData = await order.json()
    return NextResponse.json({ id: orderData.id })
  } catch (e) {
    console.error('PayPal create order error:', e)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
