import { join } from 'path'
import { writeFile } from 'fs/promises'
import { files } from '../../database/schema';

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const body = await readMultipartFormData(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const uploadedFiles = []

  for (const file of body) {
    if (file.filename) {
      const filename = `${Date.now()}-${file.filename}`
      const savedPath = join(process.cwd(), 'public', 'uploads', filename)
      await writeFile(savedPath, file.data)

      const fileRecord = await db.insert(files).values({
        filename: file.filename,
        path: `/uploads/${filename}`,
        size: file.data.length,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date(),
      }).returning().get()

      uploadedFiles.push(fileRecord)
    }
  }

  // Notify listeners about the new file
  fileHub.emit('change')

  return {
    success: true,
    files: uploadedFiles
  }
})
