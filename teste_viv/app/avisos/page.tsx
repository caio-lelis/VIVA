"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, Info, Calendar, Pin, ChevronRight } from "lucide-react"
import { apiGet, apiSend } from "@/lib/api"

type AvisoType = "urgente" | "importante" | "informativo"

interface Aviso {
  id: string
  title: string
  content: string
  type: AvisoType
  date: string
  pinned: boolean
  read: boolean
}

interface AvisosResponse {
  items: Aviso[]
  unreadCount: number
}

const typeConfig: Record<AvisoType, { icon: typeof Bell; color: string; label: string; badgeClass: string }> = {
  urgente: { icon: AlertTriangle, color: "text-red-600", label: "Urgente", badgeClass: "bg-red-100 text-red-700 border-red-300" },
  importante: { icon: Bell, color: "text-accent", label: "Importante", badgeClass: "bg-orange-100 text-orange-700 border-orange-300" },
  informativo: { icon: Info, color: "text-blue-600", label: "Informativo", badgeClass: "bg-blue-100 text-blue-700 border-blue-300" },
}

export default function AvisosPage() {
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null)
  const [filter, setFilter] = useState<AvisoType | "todos">("todos")

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<AvisosResponse>("/api/avisos")
        setAvisos(data.items)
      } catch (error) {
        console.error("Erro ao carregar avisos:", error)
      }
    }

    void load()
  }, [])

  const filteredAvisos = avisos.filter((aviso) => filter === "todos" || aviso.type === filter)
  const pinnedAvisos = filteredAvisos.filter((a) => a.pinned)
  const regularAvisos = filteredAvisos.filter((a) => !a.pinned)

  const markAsRead = async (id: string) => {
    try {
      await apiSend(`/api/avisos/${id}/read`, "PATCH")
      setAvisos((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
      setSelectedAviso((prev) => (prev?.id === id ? { ...prev, read: true } : prev))
    } catch (error) {
      console.error("Erro ao marcar aviso como lido:", error)
    }
  }

  const unreadCount = avisos.filter((a) => !a.read).length

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="avisos" />

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-primary">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Avisos e Comunicados</h1>
              <p className="text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} aviso(s) nao lido(s)` : "Todos os avisos lidos"}</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {(["todos", "urgente", "importante", "informativo"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="rounded-lg border border-border">
                {f === "todos" ? "Todos" : typeConfig[f].label}
              </Button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          <section className="space-y-4">
            {pinnedAvisos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Pin className="h-3 w-3" /> Fixados
                </h3>
                {pinnedAvisos.map((aviso) => {
                  const config = typeConfig[aviso.type]
                  const Icon = config.icon
                  return (
                    <Card
                      key={aviso.id}
                      onClick={() => {
                        setSelectedAviso(aviso)
                        if (!aviso.read) {
                          void markAsRead(aviso.id)
                        }
                      }}
                      className={`cursor-pointer border border-border rounded-lg transition-all hover:shadow-md ${!aviso.read ? "bg-secondary" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{aviso.title}</h4>
                                {!aviso.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{aviso.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`text-xs rounded-lg border ${config.badgeClass}`}>{config.label}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(aviso.date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {regularAvisos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recentes</h3>
                {regularAvisos.map((aviso) => {
                  const config = typeConfig[aviso.type]
                  const Icon = config.icon
                  return (
                    <Card
                      key={aviso.id}
                      onClick={() => {
                        setSelectedAviso(aviso)
                        if (!aviso.read) {
                          void markAsRead(aviso.id)
                        }
                      }}
                      className={`cursor-pointer border border-border rounded-lg transition-all hover:shadow-md ${!aviso.read ? "bg-secondary" : ""}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{aviso.title}</h4>
                                {!aviso.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{aviso.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={`text-xs rounded-lg border ${config.badgeClass}`}>{config.label}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(aviso.date).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredAvisos.length === 0 && <div className="text-center py-12 text-muted-foreground">Nenhum registro disponível para o filtro selecionado.</div>}
          </section>

          <aside>
            {selectedAviso ? (
              <Card className="border border-border rounded-lg shadow-sm sticky top-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {(() => {
                      const config = typeConfig[selectedAviso.type]
                      const Icon = config.icon
                      return <Icon className={`h-5 w-5 ${config.color}`} />
                    })()}
                    <Badge className={`text-xs rounded-lg border ${typeConfig[selectedAviso.type].badgeClass}`}>{typeConfig[selectedAviso.type].label}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{selectedAviso.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedAviso.date).toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm text-foreground leading-relaxed">{selectedAviso.content}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-muted-foreground rounded-lg">
                <CardContent className="p-5 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione um aviso para consultar os detalhes</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
