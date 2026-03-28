import { NextRequest, NextResponse } from 'next/server'
import { checkUsageLimit } from '@/lib/usage'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const email = token?.email as string | null
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'

  const usage = await checkUsageLimit(email, ip)

  return NextResponse.json({
    plan: usage.plan,
    remaining: usage.remaining,
    deepRemaining: usage.deepRemaining ?? 0,
  })
}
