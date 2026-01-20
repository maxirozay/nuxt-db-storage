import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

let s3Client: S3Client | null = null

export const useS3 = () => {
  const config = useRuntimeConfig()
  
  if (!s3Client && config.s3.endpoint && config.s3.accessKeyId) {
    s3Client = new S3Client({
      region: config.s3.region,
      endpoint: config.s3.endpoint,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey
      },
      forcePathStyle: true // Required for many S3-compatible providers like MinIO/Infomaniak
    })
  }
  return s3Client
}

export const uploadToS3 = async (key: string, body: Buffer, contentType: string) => {
  const client = useS3()
  if (!client) return null
  
  const config = useRuntimeConfig()
  
  await client.send(new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read' // Assumes public bucket
  }))

  if (config.s3.publicUrl) {
    return `${config.s3.publicUrl}/${key}`
  }
  // Fallback to constructing URL from endpoint if not provided
  // This might be tricky depending on virtual-host style vs path style.
  // We'll assume the user provides publicUrl for simplicity or we return the key?
  // Let's try to construct a standard one or return null so the caller decides.
  return `${config.s3.endpoint}/${config.s3.bucket}/${key}`
}


export const deleteFromS3 = async (key: string) => {
  const client = useS3()
  if (!client) return
  
  const config = useRuntimeConfig()
  
  try {
    await client.send(new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key
    }))
  } catch (e) {
    console.error('Failed to delete from S3', e)
  }
}
