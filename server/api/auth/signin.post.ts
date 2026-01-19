import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(12),
})

export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  let user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user) {
    user = await db.insert(users).values({
      email,
      name: email.split('@')[0],
      password: await hashPassword(password)
    }).returning().get()
  }
  
  if (user!.password && await verifyPassword(user.password, password)) {
    await setUserSession(event, {
      user: {
        id: user.id,
        email,
        name: user.name,
      },
    })
    return {}
  }
  throw createError({
    status: 401,
    message: 'Bad credentials',
  })
})
