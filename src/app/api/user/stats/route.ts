import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

async function getDB() {
  try {
    const ctx = getCloudflareContext()
    const db = (ctx?.env as any)?.DB
    if (db) return db
  } catch {}
  try {
    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx?.env as any)?.DB
    if (db) return db
  } catch {}
  return null
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const db = await getDB()
    if (!db) return NextResponse.json({ plan: 'free', credits: 0, total_readings: 0 })

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
    return NextResponse.json({ plan: 'free', credits: 0, total_readings: 0 })
  }
}
