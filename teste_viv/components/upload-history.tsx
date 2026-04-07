'use client'

import { File, FileText, File as FileIcon, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatFileSize, formatDate } from '@/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: string
  url: string
}

interface UploadHistoryProps {
  files: UploadedFile[]
  onDelete?: (fileId: string) => void
  isLoading?: boolean
}

export function UploadHistory({ files, onDelete, isLoading }: UploadHistoryProps) {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Card>
    )
  }

  if (files.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <FileIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <p className="mt-4 text-sm text-muted-foreground">
            Nenhum arquivo enviado ainda
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Envie seus documentos acima para começar
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Arquivos Enviados ({files.length})
      </h3>
      <div className="space-y-2">
        {files.map((file) => (
          <Card
            key={file.id}
            className="flex items-center justify-between p-4 hover:bg-secondary transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {file.type.startsWith('image/') ? (
                  <div className="h-10 w-10 rounded bg-blue-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                ) : file.type === 'application/pdf' ? (
                  <div className="h-10 w-10 rounded bg-red-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                    <File className="h-5 w-5 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(file.uploadedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
                title="Baixar arquivo"
              >
                <Download className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(file.id)}
                  className="hover:text-destructive"
                  title="Deletar arquivo"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
