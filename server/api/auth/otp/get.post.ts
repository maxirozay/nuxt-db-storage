import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schema'

const bodySchema = z.object({
  email: z.email(),
})

export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse)

  if (!email || typeof email !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }

  let user = (await db.select().from(users).where(eq(users.email, email)))[0]

  if (!user) {
    user = (await db.insert(users).values({
      // id: crypto.randomUUID(), // sqlite
      email,
      name: email.split('@')[0]
    }).returning())[0]
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  await setUserSession(event, {
    otp,
    otpEmail: email,
    otpExpiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  })

  console.log(`[AUTH] OTP for ${email}: ${otp}`)

  return { success: true }
})
