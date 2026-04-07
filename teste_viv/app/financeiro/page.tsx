"use client"

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Folder,
  Loader2,
  ReceiptText,
  RefreshCcw,
  TableProperties,
  Upload,
} from "lucide-react"
import { API_BASE_URL, apiGet } from "@/lib/api"

type ViewMode = "tabela" | "visual"

type NotaFiscal = {
  key: string
  fileName: string
  size: number
  sizeLabel: string
  lastModified: string | null
  downloadPath: string
}

type MesesResponse = { items: string[] }
type NotasResponse = {
  dateRef: string
  directory: string
  items: NotaFiscal[]
}
type ReportResponse = {
  success: boolean
  summary: string
  processedFiles: number
  totalDetectedAmount: number
  report?: {
    key: string
    downloadPath: string
  }
}

function dateRefFromDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = String(date.getFullYear())
  return `${month}-${year}`
}

function dateLabel(dateRef: string): string {
  const [month, year] = dateRef.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

function moveMonth(date: Date, offset: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + offset)
  return next
}

function isImageFile(fileName: string): boolean {
  return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(fileName)
}

function isPdfFile(fileName: string): boolean {
  return /\.pdf$/i.test(fileName)
}

export default function FinanceiroPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [mesesDisponiveis, setMesesDisponiveis] = useState<string[]>([])
  const [notas, setNotas] = useState<NotaFiscal[]>([])
  const [directory, setDirectory] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("tabela")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [lastReport, setLastReport] = useState<ReportResponse | null>(null)

  const dateRef = useMemo(() => dateRefFromDate(currentDate), [currentDate])

  const loadMeses = useCallback(async () => {
    const response = await apiGet<MesesResponse>("/api/financeiro/notas-fiscais/meses")
    setMesesDisponiveis(response.items || [])
  }, [])

  const loadNotas = useCallback(async (reference: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await apiGet<NotasResponse>(`/api/financeiro/notas-fiscais?date_ref=${reference}`)
      setNotas(response.items || [])
      setDirectory(response.directory || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar notas fiscais")
      setNotas([])
      setDirectory("")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMeses()
  }, [loadMeses])

  useEffect(() => {
    void loadNotas(dateRef)
  }, [dateRef, loadNotas])

  const onUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      for (const file of selectedFiles) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("date_ref", dateRef)

        const response = await fetch(`${API_BASE_URL}/api/financeiro/notas-fiscais/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Falha no upload")
        }
      }

      setSuccess(`${selectedFiles.length} arquivo(s) enviado(s) com sucesso para ${dateRef}.`)
      await Promise.all([loadNotas(dateRef), loadMeses()])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar arquivos")
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const onGenerateReport = async () => {
    setGeneratingReport(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE_URL}/api/financeiro/notas-fiscais/gerar-relatorio?date_ref=${dateRef}`, {
        method: "POST",
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Falha ao gerar relatorio")
      }

      const payload = (await response.json()) as ReportResponse
      setLastReport(payload)
      setSuccess("Relatorio gerado com sucesso.")
      await loadMeses()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar relatorio")
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="financeiro" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
                <ReceiptText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Financeiro - Notas Fiscais</h1>
                <p className="text-sm text-muted-foreground">Gerencie por mes, envie notas ao MinIO e gere relatorio consolidado</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-sm border-2 border-foreground"
                onClick={() => setCurrentDate((value) => moveMonth(value, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-52 rounded-sm border-2 border-foreground bg-card px-4 py-2 text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Referencia</p>
                <p className="text-sm font-semibold text-foreground">{dateLabel(dateRef)}</p>
                <p className="text-xs text-muted-foreground">{dateRef}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-sm border-2 border-foreground"
                onClick={() => setCurrentDate((value) => moveMonth(value, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px]">
          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border-2 border-foreground bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Enviar notas fiscais
                  <input type="file" multiple className="hidden" onChange={onUploadFiles} disabled={uploading} />
                </label>

                <Button
                  type="button"
                  className="rounded-sm border-2 border-foreground"
                  onClick={onGenerateReport}
                  disabled={generatingReport || notas.length === 0}
                >
                  {generatingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Gerar relatorio
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-sm border-2 border-foreground"
                  onClick={() => {
                    void loadNotas(dateRef)
                    void loadMeses()
                  }}
                  disabled={loading}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Atualizar
                </Button>

                <Badge className="rounded-sm border-2 border-foreground bg-secondary text-secondary-foreground">
                  {notas.length} nota(s) no mes
                </Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Folder className="h-3 w-3" />
                Diretorio MinIO: <span className="font-semibold text-foreground">{directory || `notas_fiscais${dateRef}/`}</span>
              </div>

              {error && <p className="mt-3 rounded-sm border-2 border-destructive bg-red-50 px-3 py-2 text-sm text-destructive">{error}</p>}
              {success && <p className="mt-3 rounded-sm border-2 border-green-700 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

              {lastReport?.success && lastReport.report && (
                <div className="mt-3 rounded-sm border-2 border-foreground bg-secondary p-3">
                  <p className="text-sm font-semibold text-foreground">Ultimo relatorio</p>
                  <p className="text-xs text-muted-foreground mt-1">{lastReport.summary}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Arquivos processados: {lastReport.processedFiles} | Total detectado: R$ {lastReport.totalDetectedAmount.toFixed(2).replace(".", ",")}
                  </p>
                  <a
                    href={`${API_BASE_URL}${lastReport.report.downloadPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex rounded-sm border-2 border-foreground px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    Baixar PDF
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Meses com notas</p>
              <div className="mt-3 flex max-h-52 flex-col gap-2 overflow-auto pr-1">
                {mesesDisponiveis.length === 0 && <p className="text-sm text-muted-foreground">Nenhum mes encontrado.</p>}
                {mesesDisponiveis.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      const [m, y] = item.split("-")
                      setCurrentDate(new Date(Number(y), Number(m) - 1, 1))
                    }}
                    className={`rounded-sm border-2 px-3 py-2 text-left text-sm ${item === dateRef
                        ? "border-foreground bg-primary text-primary-foreground"
                        : "border-foreground bg-card text-foreground"
                      }`}
                  >
                    {dateLabel(item)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-4 flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === "tabela" ? "default" : "outline"}
            className="rounded-sm border-2 border-foreground"
            onClick={() => setViewMode("tabela")}
          >
            <TableProperties className="h-4 w-4" />
            Tabela
          </Button>
          <Button
            type="button"
            variant={viewMode === "visual" ? "default" : "outline"}
            className="rounded-sm border-2 border-foreground"
            onClick={() => setViewMode("visual")}
          >
            <Eye className="h-4 w-4" />
            Visual
          </Button>
        </section>

        {loading ? (
          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando notas fiscais...
            </CardContent>
          </Card>
        ) : null}

        {!loading && viewMode === "tabela" && (
          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Arquivo</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Tamanho</th>
                    <th className="p-4 text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">Enviado em</th>
                    <th className="p-4 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">Acao</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                        Nenhuma nota fiscal para {dateRef}.
                      </td>
                    </tr>
                  )}
                  {notas.map((nota) => (
                    <tr key={nota.key} className="border-b border-muted last:border-0">
                      <td className="p-4 text-sm font-medium text-foreground">{nota.fileName}</td>
                      <td className="p-4 text-sm text-muted-foreground">{nota.sizeLabel}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {nota.lastModified ? new Date(nota.lastModified).toLocaleString("pt-BR") : "-"}
                      </td>
                      <td className="p-4 text-right">
                        <a
                          href={`${API_BASE_URL}${nota.downloadPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-sm border-2 border-foreground px-3 py-1.5 text-xs font-semibold text-foreground"
                        >
                          Baixar
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {!loading && viewMode === "visual" && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notas.length === 0 && (
              <Card className="border-2 border-foreground rounded-sm sm:col-span-2 lg:col-span-3">
                <CardContent className="p-6 text-center text-sm text-muted-foreground">
                  Nenhuma nota fiscal para {dateRef}.
                </CardContent>
              </Card>
            )}
            {notas.map((nota) => (
              <Card key={nota.key} className="border-2 border-foreground rounded-sm">
                <CardContent className="p-4">
                  <div className="mb-3 h-28 overflow-hidden rounded-sm border-2 border-foreground bg-secondary">
                    {isImageFile(nota.fileName) ? (
                      <img
                        src={`${API_BASE_URL}${nota.downloadPath}`}
                        alt={nota.fileName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : isPdfFile(nota.fileName) ? (
                      <div className="flex h-full items-center justify-center gap-2 text-sm font-semibold text-foreground">
                        <FileText className="h-5 w-5" />
                        PDF
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ReceiptText className="h-8 w-8 text-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground" title={nota.fileName}>
                    {nota.fileName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{nota.sizeLabel}</p>
                  <p className="text-xs text-muted-foreground">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {nota.lastModified ? new Date(nota.lastModified).toLocaleDateString("pt-BR") : "-"}
                  </p>
                  <a
                    href={`${API_BASE_URL}${nota.downloadPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-sm border-2 border-foreground px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    Abrir arquivo
                  </a>
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
