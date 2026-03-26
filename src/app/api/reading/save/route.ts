import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, type, question, result } = body

    if (!email || !type || !result) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx.env as any).DB

    if (!db) {
      return NextResponse.json({ ok: true, note: 'no db' })
    }

    const id = crypto.randomUUID()
    const now = Date.now()
    
    await db.prepare(
      'INSERT INTO readings (id, user_id, type, question, result, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email, type, question || null, result, now).run()

    return NextResponse.json({ ok: true, id })
  } catch (error: any) {
    console.error('Save reading error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
