export async function saveUser(db: any, user: any) {
  const now = Date.now()
  await db.prepare(
    'INSERT OR REPLACE INTO users (id, email, name, image, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, user.email, user.name, user.image, now).run()
}

export async function saveReading(db: any, userId: string, type: string, question: string | null, result: string) {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.prepare(
    'INSERT INTO readings (id, user_id, type, question, result, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, type, question, result, now).run()
}
