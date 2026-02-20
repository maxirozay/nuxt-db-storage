import { eq } from 'drizzle-orm'
import { users } from '../database/schema'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  const user = (await db.select({ settings: users.settings })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  )[0]
  
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  const updatedSettings = {
    ...((user.settings as object) || {}),
    is_public: true
  }

  await db.update(users)
    .set({ settings: updatedSettings })
    .where(eq(users.id, userId))

  return { success: true }
})
