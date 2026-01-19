import { eq } from 'drizzle-orm'
import { users } from '~~/server/database/schema'
import { z } from 'zod'

const bodySchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
})

export default defineEventHandler(async (event) => {
  const { email, otp } = await readValidatedBody(event, bodySchema.parse)

  if (!email || !otp) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and OTP are required'
    })
  }

  const session = await getUserSession(event)
  
  if (
    !session.otp ||
    !session.otpEmail ||
    !session.otpExpiresAt ||
    session.otp !== otp ||
    session.otpEmail !== email ||
    Date.now() > session.otpExpiresAt
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired OTP'
    })
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get()

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  })

  return { success: true }
})
