import { files } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const allFiles = await db.select().from(files).orderBy(files.uploaded)
  return allFiles
})
