"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Wrench, Plus, Clock, CheckCircle2, AlertCircle, XCircle, ChevronRight, Calendar, MapPin } from "lucide-react"
import { apiGet, apiSend } from "@/lib/api"

type ChamadoStatus = "aberto" | "em_andamento" | "concluido" | "cancelado"
type ChamadoCategory = "hidraulica" | "eletrica" | "estrutural" | "limpeza" | "outros"

interface Chamado {
  id: string
  title: string
  description: string
  category: ChamadoCategory
  status: ChamadoStatus
  location: string
  createdAt: string
  updatedAt: string
  unit: string
}

interface ChamadosResponse {
  items: Chamado[]
  openCount: number
}

const statusConfig: Record<ChamadoStatus, { icon: typeof Clock; label: string; color: string }> = {
  aberto: { icon: AlertCircle, label: "Aberto", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  em_andamento: { icon: Clock, label: "Em andamento", color: "bg-blue-100 text-blue-700 border-blue-300" },
  concluido: { icon: CheckCircle2, label: "Concluido", color: "bg-green-100 text-green-700 border-green-300" },
  cancelado: { icon: XCircle, label: "Cancelado", color: "bg-red-100 text-red-700 border-red-300" },
}

const categoryConfig: Record<ChamadoCategory, { label: string; color: string }> = {
  hidraulica: { label: "Hidraulica", color: "bg-blue-500" },
  eletrica: { label: "Eletrica", color: "bg-yellow-500" },
  estrutural: { label: "Estrutural", color: "bg-orange-500" },
  limpeza: { label: "Limpeza", color: "bg-green-500" },
  outros: { label: "Outros", color: "bg-gray-500" },
}

const USER_UNIT = "Ap. 204"

export default function ChamadosPage() {
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [selectedChamado, setSelectedChamado] = useState<Chamado | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [filter, setFilter] = useState<ChamadoStatus | "todos">("todos")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<ChamadoCategory>("outros")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  const loadChamados = async () => {
    try {
      const data = await apiGet<ChamadosResponse>("/api/chamados")
      setChamados(data.items)
      setOpenCount(data.openCount)
    } catch (error) {
      console.error("Erro ao carregar chamados:", error)
    }
  }

  useEffect(() => {
    void loadChamados()
  }, [])

  const filteredChamados = useMemo(
    () => chamados.filter((c) => (filter === "todos" ? true : c.status === filter)).filter((c) => c.unit === USER_UNIT),
    [chamados, filter]
  )

  const handleCreateChamado = async () => {
    if (!title.trim() || !location.trim() || !description.trim()) {
      return
    }

    try {
      await apiSend<Chamado>("/api/chamados", "POST", {
        title,
        description,
        category,
        location,
        unit: USER_UNIT,
      })
      setTitle("")
      setLocation("")
      setDescription("")
      setCategory("outros")
      setShowNewForm(false)
      await loadChamados()
    } catch (error) {
      console.error("Erro ao criar chamado:", error)
    }
  }

  const handleCancelChamado = async (id: string) => {
    try {
      const updated = await apiSend<Chamado>(`/api/chamados/${id}/status`, "PATCH", { status: "cancelado" })
      setChamados((prev) => prev.map((c) => (c.id === id ? updated : c)))
      setSelectedChamado((prev) => (prev?.id === id ? updated : prev))
      setOpenCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Erro ao cancelar chamado:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="chamados" />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chamados de Manutencao</h1>
                <p className="text-sm text-muted-foreground">{openCount > 0 ? `${openCount} chamado(s) em aberto` : "Nenhum chamado em aberto"}</p>
              </div>
            </div>
            <Button onClick={() => setShowNewForm(!showNewForm)} className="border-2 border-foreground rounded-sm gap-2">
              <Plus className="h-4 w-4" />
              Novo Chamado
            </Button>
          </div>
        </section>

        {showNewForm && (
          <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground mb-6">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-4">Abrir Novo Chamado</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Titulo</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Vazamento na torneira" className="mt-1 border-2 border-foreground rounded-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Object.keys(categoryConfig) as ChamadoCategory[]).map((cat) => (
                      <Button
                        key={cat}
                        variant={category === cat ? "default" : "outline"}
                        size="sm"
                        className="border-2 border-foreground rounded-sm"
                        onClick={() => setCategory(cat)}
                      >
                        <span className={`h-2 w-2 rounded-full mr-2 ${categoryConfig[cat].color}`} />
                        {categoryConfig[cat].label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Localizacao</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Apartamento 204 - Cozinha" className="mt-1 border-2 border-foreground rounded-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descricao</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva o problema com detalhes..." className="mt-1 border-2 border-foreground rounded-sm min-h-[100px]" />
                </div>
                <div className="flex gap-2">
                  <Button className="border-2 border-foreground rounded-sm" onClick={() => void handleCreateChamado()}>Enviar Chamado</Button>
                  <Button variant="outline" onClick={() => setShowNewForm(false)} className="border-2 border-foreground rounded-sm">Cancelar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(["todos", "aberto", "em_andamento", "concluido"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="rounded-sm border-2 border-foreground">
                {f === "todos" ? "Todos" : statusConfig[f as ChamadoStatus].label}
              </Button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            {filteredChamados.length > 0 ? (
              filteredChamados.map((chamado) => {
                const status = statusConfig[chamado.status]
                const StatusIcon = status.icon
                const categoryItem = categoryConfig[chamado.category]

                return (
                  <Card
                    key={chamado.id}
                    onClick={() => setSelectedChamado(chamado)}
                    className={`cursor-pointer border-2 border-foreground rounded-sm transition-all hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground ${selectedChamado?.id === chamado.id ? "shadow-[3px_3px_0px_0px] shadow-foreground bg-secondary" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className={`h-3 w-3 rounded-full mt-1.5 shrink-0 ${categoryItem.color}`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground">{chamado.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{chamado.description}</p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <Badge className={`text-xs rounded-sm border ${status.color}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {chamado.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">Nenhum chamado encontrado para este filtro.</div>
            )}
          </section>

          <aside>
            {selectedChamado ? (
              <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground sticky top-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`h-3 w-3 rounded-full ${categoryConfig[selectedChamado.category].color}`} />
                    <span className="text-sm text-muted-foreground">{categoryConfig[selectedChamado.category].label}</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{selectedChamado.title}</h3>
                  <Badge className={`text-xs rounded-sm border mb-4 ${statusConfig[selectedChamado.status].color}`}>{statusConfig[selectedChamado.status].label}</Badge>

                  <div className="space-y-3 text-sm border-t-2 border-foreground pt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{selectedChamado.location}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-foreground">Aberto em {new Date(selectedChamado.createdAt).toLocaleDateString("pt-BR")}</p>
                        <p className="text-xs text-muted-foreground">Atualizado em {new Date(selectedChamado.updatedAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-foreground pt-4 mt-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Descricao</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedChamado.description}</p>
                  </div>

                  {selectedChamado.status === "aberto" && (
                    <Button variant="outline" className="w-full mt-4 border-2 border-foreground rounded-sm text-red-600" onClick={() => void handleCancelChamado(selectedChamado.id)}>
                      Cancelar Chamado
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground rounded-sm">
                <CardContent className="p-5 text-center">
                  <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione um chamado para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
