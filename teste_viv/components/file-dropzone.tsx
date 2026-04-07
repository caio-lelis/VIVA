"use client"

import { useCallback, useState } from "react"
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileWithProgress {
  file: File
  id: string
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  errorMessage?: string
}

interface FileDropzoneProps {
  onUpload: (files: File[]) => Promise<void>
  acceptedTypes?: string[]
  maxSizeMB?: number
  isLoading?: boolean
}

export function FileDropzone({
  onUpload,
  acceptedTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png"],
  maxSizeMB = 10,
  isLoading = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = (file: File): string | null => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!acceptedTypes.some((type) => extension === type.toLowerCase())) {
      return `Tipo de arquivo não permitido. Aceitos: ${acceptedTypes.join(", ")}`
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxSizeMB}MB`
    }
    return null
  }

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const newFileItems: FileWithProgress[] = fileArray.map((file) => {
        const error = validateFile(file)
        return {
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          progress: 0,
          status: error ? "error" : "pending",
          errorMessage: error || undefined,
        }
      })
      setFiles((prev) => [...prev, ...newFileItems])
    },
    [acceptedTypes, maxSizeMB]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
      }
    },
    [addFiles]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending")
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    for (const fileItem of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "uploading" as const, progress: 0 } : f
        )
      )

      try {
        await onUpload([fileItem.file])
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "success" as const, progress: 100 } : f
          )
        )
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: "error" as const,
                  errorMessage: error instanceof Error ? error.message : "Erro ao enviar arquivo",
                }
              : f
          )
        )
      }
    }

    setIsUploading(false)
  }

  const pendingCount = files.filter((f) => f.status === "pending").length
  const successCount = files.filter((f) => f.status === "success").length

  return (
    <div className="space-y-6">
      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-sm p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-accent bg-accent/10"
            : "border-foreground/50 hover:border-foreground bg-card"
        )}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          accept={acceptedTypes.join(",")}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-sm border-2 border-foreground bg-secondary">
            <Upload className="h-8 w-8 text-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              Arraste e solte arquivos aqui
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              ou clique para selecionar
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: {acceptedTypes.join(", ")} • Máximo {maxSizeMB}MB por arquivo
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
              Arquivos Selecionados
            </h3>
            {successCount > 0 && (
              <span className="text-xs text-accent font-medium">
                {successCount} arquivo(s) enviado(s)
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className={cn(
                  "flex items-center gap-4 p-4 border-2 rounded-sm bg-card",
                  fileItem.status === "error"
                    ? "border-destructive"
                    : fileItem.status === "success"
                    ? "border-accent"
                    : "border-foreground"
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-secondary">
                  <File className="h-5 w-5 text-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {fileItem.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    {fileItem.errorMessage && (
                      <span className="ml-2 text-destructive">
                        • {fileItem.errorMessage}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {fileItem.status === "uploading" && (
                    <Loader2 className="h-5 w-5 text-accent animate-spin" />
                  )}
                  {fileItem.status === "success" && (
                    <CheckCircle className="h-5 w-5 text-accent" />
                  )}
                  {fileItem.status === "error" && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {(fileItem.status === "pending" || fileItem.status === "error") && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 hover:bg-secondary rounded-sm transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pendingCount > 0 && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-foreground"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Enviar {pendingCount} arquivo(s)
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
