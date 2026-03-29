import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getCloudflareContext } from "@opennextjs/cloudflare"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        const email = user.email
        const name = user.name || ''
        const image = user.image || ''
        if (!email) return true

        const ctx = await getCloudflareContext({ async: true })
        const db = (ctx.env as any).DB

        if (!db) return true

        // Upsert user — never overwrite plan/count fields on re-login
        await db.prepare(
          `INSERT INTO users (email, name, image, plan, count, last_reset, deep_count, last_deep_date, trial_used)
           VALUES (?, ?, ?, 'free', 0, '', 0, '', 0)
           ON CONFLICT(email) DO UPDATE SET name=excluded.name, image=excluded.image`
        ).bind(email, name, image).run()

        // Check if eligible for 3-day Pro trial (new users only, trial_used = 0)
        const row = await db.prepare(
          `SELECT plan, trial_used FROM users WHERE email = ?`
        ).bind(email).first()

        if (row && row.trial_used === 0 && row.plan === 'free') {
          const trialExpiry = Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days from now
          await db.prepare(
            `UPDATE users SET plan='pro', plan_expires_at=?, trial_used=1 WHERE email=?`
          ).bind(trialExpiry, email).run()
        }
      } catch (e) {
        // Never block login due to trial logic errors
        console.error('signIn callback error:', e)
      }
      return true
    }
  }
})

export { handler as GET, handler as POST }
