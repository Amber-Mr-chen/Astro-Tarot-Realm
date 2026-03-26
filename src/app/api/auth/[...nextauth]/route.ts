import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

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
        // @ts-ignore
        const db = (process.env as any).DB
        if (db && user.email) {
          const now = Date.now()
          await db.prepare(
            'INSERT OR REPLACE INTO users (id, email, name, image, created_at) VALUES (?, ?, ?, ?, ?)'
          ).bind(user.id || user.email, user.email, user.name, user.image, now).run()
        }
      } catch (error) {
        console.error('Failed to save user:', error)
      }
      return true
    },
  },
})

export { handler as GET, handler as POST }
