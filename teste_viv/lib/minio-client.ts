'use server'

import { Client } from 'minio'

export function createMinioClient() {
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000'
  const accessKey = process.env.MINIO_ACCESS_KEY || ''
  const secretKey = process.env.MINIO_SECRET_KEY || ''
  const useSSL = endpoint.startsWith('https')

  const client = new Client({
    endPoint: endpoint.replace(/https?:\/\//, ''),
    accessKey,
    secretKey,
    useSSL,
  })

  return client
}

export async function uploadFileToMinio(
  bucketName: string,
  fileName: string,
  fileContent: Buffer,
  contentType: string
) {
  try {
    const client = createMinioClient()

    // Verificar se bucket existe, caso contrário criar
    const bucketExists = await client.bucketExists(bucketName)
    if (!bucketExists) {
      await client.makeBucket(bucketName, 'us-east-1')
    }

    // Upload do arquivo
    const objectName = `${Date.now()}-${fileName}`
    await client.putObject(bucketName, objectName, fileContent, fileContent.length, {
      'Content-Type': contentType,
    })

    return {
      success: true,
      objectName,
      bucketName,
      url: `${process.env.MINIO_ENDPOINT}/${bucketName}/${objectName}`,
    }
  } catch (error) {
    console.error('Erro ao fazer upload no MinIO:', error)
    throw error
  }
}
