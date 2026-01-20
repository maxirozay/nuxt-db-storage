import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { files } from '../../database/schema';

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const body = await readMultipartFormData(event)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const uploadedFiles = []

  let subDir = ''
  const pathPart = body.find(p => p.name === 'path')
  if (pathPart) {
    subDir = pathPart.data.toString().trim()
    // Prevent directory traversal
    if (subDir.includes('..') || subDir.startsWith('/')) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
    }
  }

  for (const file of body) {
    if (file.filename) {
      const filename = file.filename
      
      let webPath
      // Try S3 first if configured
      const s3 = useS3()
      if (s3) {
         const key = join('uploads', subDir, filename).replace(/\\/g, '/')
         const s3Key = key.startsWith('/') ? key.substring(1) : key
         const url = await uploadToS3(s3Key, file.data, file.type || 'application/octet-stream')
         webPath = url
      }
      
      // Fallback to local
      if (!webPath) {
        const uploadDir = join(process.cwd(), 'public', 'uploads', subDir)
        await mkdir(uploadDir, { recursive: true })
        
        const savedPath = join(uploadDir, filename)
        await writeFile(savedPath, file.data)
  
        webPath = join('/uploads', subDir, filename)
      }

      const fileRecord = await db.insert(files).values({
        filename,
        path: webPath,
        size: file.data.length,
        mimeType: file.type || 'application/octet-stream',
        uploadedAt: new Date(),
      }).returning().get()

      uploadedFiles.push(fileRecord)
    }
  }

  // Notify listeners about the new file
  for (const file of uploadedFiles) {
    fileHub.emit('change', { path: file.path })
  }

  return {
    success: true,
    files: uploadedFiles
  }
})
