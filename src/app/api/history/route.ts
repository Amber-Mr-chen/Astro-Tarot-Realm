import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // @ts-ignore
    const db = (process.env as any).DB
    if (!db) {
      return NextResponse.json({ readings: [] })
    }

    const result = await db.prepare(
      `SELECT r.* FROM readings r
       JOIN users u ON r.user_id = u.id
       WHERE u.email = ?
       ORDER BY r.created_at DESC
       LIMIT 20`
    ).bind(session.user.email).all()

    return NextResponse.json({ readings: result.results || [] })
  } catch (error) {
    return NextResponse.json({ readings: [] })
  }
}
