import { getCloudflareContext } from '@opennextjs/cloudflare'

export type UsageCheck = {
  allowed: boolean
  remaining: number
  plan: string
  deepRemaining?: number
}

export async function getDB() {
  try {
    // Try sync first (works in production worker context)
    const ctx = getCloudflareContext()
    const db = (ctx?.env as any)?.DB
    if (db) return db
  } catch {
    // fall through to async
  }
  try {
    const ctx = await getCloudflareContext({ async: true })
    const db = (ctx?.env as any)?.DB
    if (db) return db
  } catch {
    // fall through
  }
  return null
}

export async function checkUsageLimit(email: string | null, ip: string): Promise<UsageCheck> {
  const db = await getDB()
  const today = new Date().toISOString().split('T')[0]

  if (!db) {
    // DB not available — log and allow (but limit in production)
    console.error('[usage] DB binding not found')
    return { allowed: true, remaining: 99, plan: 'free', deepRemaining: 0 }
  }

  // Guest user
  if (!email) {
    try {
      const guest = await db.prepare(
        'SELECT daily_count, last_used_date FROM guest_usage WHERE ip = ?'
      ).bind(ip).first()
      const count = (guest?.last_used_date === today) ? Number(guest?.daily_count || 0) : 0
      return { allowed: count < 1, remaining: Math.max(0, 1 - count), plan: 'guest', deepRemaining: 0 }
    } catch (e) {
      console.error('[usage] guest check error:', e)
      return { allowed: true, remaining: 1, plan: 'guest', deepRemaining: 0 }
    }
  }

  // Logged in user
  try {
    const user = await db.prepare(
      'SELECT plan, plan_expires_at, daily_count, last_used_date, deep_count, last_deep_date FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) return { allowed: true, remaining: 3, plan: 'free', deepRemaining: 0 }

    const isPro = user.plan === 'pro' && (!user.plan_expires_at || Number(user.plan_expires_at) > Date.now())

    if (isPro) {
      const deepCount = (user.last_deep_date === today) ? Number(user.deep_count || 0) : 0
      return { allowed: true, remaining: 999, plan: 'pro', deepRemaining: Math.max(0, 10 - deepCount) }
    }

    const count = (user.last_used_date === today) ? Number(user.daily_count || 0) : 0
    return { allowed: count < 3, remaining: Math.max(0, 3 - count), plan: 'free', deepRemaining: 0 }
  } catch (e) {
    console.error('[usage] user check error:', e)
    return { allowed: true, remaining: 3, plan: 'free', deepRemaining: 0 }
  }
}

export async function incrementUsage(email: string | null, ip: string, isDeep = false): Promise<void> {
  const db = await getDB()
  const today = new Date().toISOString().split('T')[0]
  if (!db) {
    console.error('[usage] DB binding not found in incrementUsage')
    return
  }

  try {
    if (!email) {
      await db.prepare(`
        INSERT INTO guest_usage (ip, daily_count, last_used_date) VALUES (?, 1, ?)
        ON CONFLICT(ip) DO UPDATE SET
          daily_count = CASE WHEN last_used_date = ? THEN daily_count + 1 ELSE 1 END,
          last_used_date = ?
      `).bind(ip, today, today, today).run()
      return
    }

    const user = await db.prepare('SELECT plan FROM users WHERE email = ?').bind(email).first()
    if (!user) return

    const isPro = user.plan === 'pro'

    if (isPro && isDeep) {
      await db.prepare(`
        UPDATE users SET
          deep_count = CASE WHEN last_deep_date = ? THEN deep_count + 1 ELSE 1 END,
          last_deep_date = ?
        WHERE email = ?
      `).bind(today, today, email).run()
    } else if (!isPro) {
      await db.prepare(`
        UPDATE users SET
          daily_count = CASE WHEN last_used_date = ? THEN daily_count + 1 ELSE 1 END,
          last_used_date = ?
        WHERE email = ?
      `).bind(today, today, email).run()
    }
  } catch (e) {
    console.error('[usage] increment error:', e)
  }
}
