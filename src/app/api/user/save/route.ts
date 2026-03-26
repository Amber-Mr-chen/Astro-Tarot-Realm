import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, image, id } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx.env as any).DB

    if (!db) {
      return NextResponse.json({ ok: true, note: 'no db' })
    }

    const now = Date.now()
    
    // Check if user exists
    const existing = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    
    if (existing) {
      // User exists, only update name and image
      await db.prepare(
        'UPDATE users SET name = ?, image = ? WHERE email = ?'
      ).bind(name || '', image || '', email).run()
    } else {
      // New user, insert with defaults
      await db.prepare(
        'INSERT INTO users (id, email, name, image, plan, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(id || email, email, name || '', image || '', 'free', now).run()
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Save user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
