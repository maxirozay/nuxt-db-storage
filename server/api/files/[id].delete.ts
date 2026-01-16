import { join } from 'path'
import { unlink } from 'fs/promises'
import { eq } from 'drizzle-orm'
import { files } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  
  // 1. Get file info from DB
  const file = await db.select().from(files).where(eq(files.id, Number(id))).get()
  
  if (!file) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  // 2. Delete from disk
  // The path in DB is like /uploads/filename. We need to map it to filesystem.
  // path: /uploads/123-foo.png
  // fs: process.cwd() + /public + /uploads/123-foo.png
  
  const relativePath = file.path.replace(/^\//, '') // Remove leading slash -> uploads/123-foo.png
  const localPath = join(process.cwd(), 'public', relativePath)

  try {
    await unlink(localPath)
  } catch (e) {
    console.warn(`File not found on disk: ${localPath}`)
  }

  // 3. Delete from DB
  await db.delete(files).where(eq(files.id, Number(id)))

  return { success: true }
})
