import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, image, id } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // @ts-ignore - Cloudflare D1 binding
    const db = (request as any).cf?.env?.DB || (globalThis as any).DB || (process.env as any).DB
    if (!db) {
      return NextResponse.json({ ok: true, note: 'no db' })
    }

    const now = Date.now()
    await db.prepare(
      'INSERT OR REPLACE INTO users (id, email, name, image, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id || email, email, name || '', image || '', now).run()

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Save user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
