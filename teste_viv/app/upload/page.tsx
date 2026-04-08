"use client"

import { useState, useCallback } from "react"
import { Header } from "@/components/header"
import { FileDropzone } from "@/components/file-dropzone"
import { UploadHistory } from "@/components/upload-history"
import { ServiceSelector, type Service } from "@/components/service-selector"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url: string
  service?: string
}

export default function UploadPage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "/backend").replace(/\/$/, "")

  const handleSelectService = (service: Service) => {
    // Reset uploaded files when switching service
    setSelectedService(service)
    setUploadedFiles([])
  }

  const uploadToMinio = useCallback(
    async (files: File[]) => {
      if (!selectedService) return
      setIsUploading(true)
      const newFiles: UploadedFile[] = []

      try {
        for (const file of files) {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("service", selectedService.id)
          formData.append("folder", selectedService.folder)

          const response = await fetch(`${apiBaseUrl}/api/upload`, {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Erro ao enviar arquivo")
          }

          const data = await response.json()

          if (data.success) {
            newFiles.push({
              id: data.data.key,
              name: data.data.originalName,
              size: data.data.size,
              type: data.data.type,
              uploadedAt: new Date().toISOString(),
              url: `${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/${process.env.NEXT_PUBLIC_MINIO_BUCKET_NAME}/${data.data.key}`,
              service: selectedService.label,
            })
          }
        }

        setUploadedFiles((prev) => [...newFiles, ...prev])
      } catch (error) {
        console.error("Erro no upload:", error)
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [selectedService]
  )

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="documentos" />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Documentos
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Envio de Documentos
          </h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
            Selecione o tipo de documento que deseja enviar e depois anexe o arquivo correspondente.
          </p>
        </section>

        {/* Step 1 — Selecionar Serviço */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-foreground text-background text-xs font-bold">
              1
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Selecione o tipo de documento
            </h3>
          </div>

          <Card className="border border-border rounded-lg shadow-sm">
            <CardContent className="p-6">
              <ServiceSelector
                selected={selectedService}
                onSelect={handleSelectService}
              />
            </CardContent>
          </Card>
        </section>

        {/* Step 2 — Upload (só aparece após seleção) */}
        {selectedService && (
          <>
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedService.label}</span>
              <ChevronRight className="h-4 w-4" />
              <span>Enviar arquivo</span>
            </div>

            <section className="mb-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-accent text-accent-foreground text-xs font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                    Envie o arquivo
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Formatos aceitos para {selectedService.label}:{" "}
                    <span className="font-medium text-foreground">
                      {selectedService.acceptedTypes.join(", ")}
                    </span>
                  </p>
                </div>
              </div>

              <Card className="border border-border rounded-lg shadow-sm">
                <CardContent className="p-6 md:p-8">
                  <FileDropzone
                    onUpload={uploadToMinio}
                    isLoading={isUploading}
                    acceptedTypes={selectedService.acceptedTypes}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Histórico de uploads desta sessão */}
            {uploadedFiles.length > 0 && (
              <section className="mb-10">
                <UploadHistory files={uploadedFiles} isLoading={isUploading} />
              </section>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LegoTech. Todos os direitos reservados.
          </p>
        </footer>
      </main>
    </div>
  )
}
