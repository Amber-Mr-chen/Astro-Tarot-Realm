import { getCloudflareContext } from '@opennextjs/cloudflare'

const DAILY_LIMITS = {
  guest: 1,
  free: 3,
  pro: Infinity,
}

export async function checkUsageLimit(email: string | null, ip: string): Promise<{
  allowed: boolean
  remaining: number
  plan: string
  reason?: string
}> {
  const ctx = await getCloudflareContext({ async: true })
  const db = (ctx.env as any).DB
  const today = new Date().toISOString().split('T')[0]

  if (!db) return { allowed: true, remaining: 99, plan: 'free' }

  // Guest user
  if (!email) {
    const guest = await db.prepare(
      'SELECT daily_count, last_used_date FROM guest_usage WHERE ip = ?'
    ).bind(ip).first()

    const count = (guest?.last_used_date === today) ? (guest?.daily_count || 0) : 0
    const limit = DAILY_LIMITS.guest
    const remaining = Math.max(0, limit - count)

    return { allowed: count < limit, remaining, plan: 'guest' }
  }

  // Logged in user
  const user = await db.prepare(
    'SELECT plan, credits, plan_expires_at, daily_count, last_used_date FROM users WHERE email = ?'
  ).bind(email).first()

  if (!user) return { allowed: true, remaining: 3, plan: 'free' }

  // Check if pro plan is still valid
  const isPro = user.plan === 'pro' && (!user.plan_expires_at || user.plan_expires_at > Date.now())

  if (isPro) {
    return { allowed: true, remaining: 999, plan: 'pro' }
  }

  // Check credits
  if (user.credits > 0) {
    return { allowed: true, remaining: user.credits, plan: 'credits' }
  }

  // Free daily limit
  const count = (user.last_used_date === today) ? (user.daily_count || 0) : 0
  const limit = DAILY_LIMITS.free
  const remaining = Math.max(0, limit - count)

  return { allowed: count < limit, remaining, plan: 'free' }
}

export async function incrementUsage(email: string | null, ip: string): Promise<void> {
  const ctx = await getCloudflareContext({ async: true })
  const db = (ctx.env as any).DB
  const today = new Date().toISOString().split('T')[0]

  if (!db) return

  if (!email) {
    await db.prepare(`
      INSERT INTO guest_usage (ip, daily_count, last_used_date)
      VALUES (?, 1, ?)
      ON CONFLICT(ip) DO UPDATE SET
        daily_count = CASE WHEN last_used_date = ? THEN daily_count + 1 ELSE 1 END,
        last_used_date = ?
    `).bind(ip, today, today, today).run()
    return
  }

  const user = await db.prepare('SELECT plan, credits, last_used_date FROM users WHERE email = ?').bind(email).first()
  if (!user) return

  const isPro = user.plan === 'pro'

  if (!isPro && user.credits > 0) {
    await db.prepare('UPDATE users SET credits = credits - 1 WHERE email = ?').bind(email).run()
  } else if (!isPro) {
    await db.prepare(`
      UPDATE users SET
        daily_count = CASE WHEN last_used_date = ? THEN daily_count + 1 ELSE 1 END,
        last_used_date = ?
      WHERE email = ?
    `).bind(today, today, email).run()
  }
}
