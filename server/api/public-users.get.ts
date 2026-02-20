import { sql } from 'drizzle-orm'
import { users } from '../database/schema'

export default defineEventHandler(async (event) => {
  // List all public users
  const publicUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email
  })
  .from(users)
  .where(sql`(${users.settings} ->> 'is_public')::boolean = true`)
  // .where(sql`json_extract(${users.settings}, '$.is_public') = true`) // sqlite

  return publicUsers
})
