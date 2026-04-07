import { NextRequest, NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Check if MinIO is configured
const isMinioConfigured = Boolean(
  process.env.MINIO_ENDPOINT &&
  process.env.MINIO_ACCESS_KEY &&
  process.env.MINIO_SECRET_KEY
)

// MinIO is S3-compatible, so we use the AWS SDK
const s3Client = isMinioConfigured
  ? new S3Client({
      region: "us-east-1",
      endpoint: process.env.MINIO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true,
    })
  : null

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "condominio-docs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      )
    }

    // Read optional service metadata sent from the frontend
    const folder = (formData.get("folder") as string | null) || "outros"
    const service = (formData.get("service") as string | null) || "outros"

    // Generate unique filename organised by service folder
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const key = `${folder}/${timestamp}-${sanitizedName}`

    // Demo mode - simulate upload when MinIO is not configured
    if (!isMinioConfigured || !s3Client) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      return NextResponse.json({
        success: true,
        message: "Arquivo enviado com sucesso (modo demonstração)",
        demo: true,
        data: {
          key,
          originalName: file.name,
          size: file.size,
          type: file.type,
          service,
          folder,
        },
      })
    }

    // Production mode - upload to MinIO
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        service,
        folder,
      },
    })

    await s3Client.send(command)

    return NextResponse.json({
      success: true,
      message: "Arquivo enviado com sucesso",
      data: {
        key,
        originalName: file.name,
        size: file.size,
        type: file.type,
        service,
        folder,
      },
    })
  } catch (error) {
    console.error("Error uploading to MinIO:", error)
    return NextResponse.json(
      {
        error: "Erro ao enviar arquivo para o servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "API de upload de arquivos do condomínio",
    endpoints: {
      POST: "Enviar arquivo para o MinIO",
    },
    config: {
      bucket: BUCKET_NAME,
      endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
    },
  })
}
