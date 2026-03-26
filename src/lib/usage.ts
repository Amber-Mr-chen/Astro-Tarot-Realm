import { getCloudflareContext } from '@opennextjs/cloudflare'

export type UsageCheck = {
  allowed: boolean
  remaining: number
  plan: string
  deepRemaining?: number
}

export async function checkUsageLimit(email: string | null, ip: string): Promise<UsageCheck> {
  const ctx = await getCloudflareContext({ async: true })
  const db = (ctx.env as any).DB
  const today = new Date().toISOString().split('T')[0]

  if (!db) return { allowed: true, remaining: 99, plan: 'free', deepRemaining: 0 }

  // Guest user
  if (!email) {
    const guest = await db.prepare(
      'SELECT daily_count, last_used_date FROM guest_usage WHERE ip = ?'
    ).bind(ip).first()
    const count = (guest?.last_used_date === today) ? (guest?.daily_count || 0) : 0
    return { allowed: count < 1, remaining: Math.max(0, 1 - count), plan: 'guest', deepRemaining: 0 }
  }

  // Logged in user
  const user = await db.prepare(
    'SELECT plan, plan_expires_at, daily_count, last_used_date, deep_count, last_deep_date FROM users WHERE email = ?'
  ).bind(email).first()

  if (!user) return { allowed: true, remaining: 3, plan: 'free', deepRemaining: 0 }

  const isPro = user.plan === 'pro' && (!user.plan_expires_at || user.plan_expires_at > Date.now())

  if (isPro) {
    const deepCount = (user.last_deep_date === today) ? (user.deep_count || 0) : 0
    return { allowed: true, remaining: 999, plan: 'pro', deepRemaining: Math.max(0, 10 - deepCount) }
  }

  // Free daily limit
  const count = (user.last_used_date === today) ? (user.daily_count || 0) : 0
  return { allowed: count < 3, remaining: Math.max(0, 3 - count), plan: 'free', deepRemaining: 0 }
}

export async function incrementUsage(email: string | null, ip: string, isDeep = false): Promise<void> {
  const ctx = await getCloudflareContext({ async: true })
  const db = (ctx.env as any).DB
  const today = new Date().toISOString().split('T')[0]
  if (!db) return

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
}
