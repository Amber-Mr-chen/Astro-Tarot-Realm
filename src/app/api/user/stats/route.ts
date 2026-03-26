import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx.env as any).DB
    if (!db) return NextResponse.json({})

    const user = await db.prepare(
      'SELECT plan, credits, plan_expires_at, created_at FROM users WHERE email = ?'
    ).bind(email).first()

    const countResult = await db.prepare(
      'SELECT COUNT(*) as total FROM readings WHERE user_id = ?'
    ).bind(email).first()

    return NextResponse.json({
      ...user,
      total_readings: countResult?.total || 0,
    })
  } catch (error) {
    return NextResponse.json({})
  }
}
