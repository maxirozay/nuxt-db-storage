import { join } from 'path'
import { unlink } from 'fs/promises'
import { eq } from 'drizzle-orm'
import { files } from '../../database/schema'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = getRouterParam(event, 'id')
  
  // 1. Get file info from DB
  const file = (await db.select().from(files).where(eq(files.id, Number(id))))[0]
  
  if (!file) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  // 2. Delete from storage
  await (async () => {
    if (file.path.startsWith('http')) {
      try {
        let key = file.path
          .replace(useRuntimeConfig().s3?.publicUrl, '')
          .replace(/^\//, '')
        const config = useRuntimeConfig()
        
        // Remove bucket name from path if present (common in path-style S3 URLs)
        if (config.s3?.bucket && key.startsWith(`${config.s3.bucket}/`)) {
            key = key.slice(config.s3.bucket.length + 1)
        }
        
        await deleteFromS3(key)
      } catch (e) {
        console.warn('Failed to delete S3 file', e)
      }
      return
    }

    const relativePath = file.path.replace(/^\//, '') // Remove leading slash -> uploads/123-foo.png
    const localPath = join(process.cwd(), 'public', relativePath)

    try {
      await unlink(localPath)
    } catch (e) {
      console.warn(`File not found on disk: ${localPath}`)
    }
  })()

  // 3. Delete from DB
  await db.delete(files).where(eq(files.id, Number(id)))

  // Notify listeners about the deleted file
  fileHub.emit('change', { path: file.path })

  return { success: true }
})
