"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, CheckCircle2, Users, Calendar, ChevronRight, Vote } from "lucide-react"
import { apiGet, apiSend } from "@/lib/api"

type EnqueteStatus = "ativa" | "encerrada"

interface Opcao {
  id: string
  text: string
  votes: number
}

interface Enquete {
  id: string
  title: string
  description: string
  status: EnqueteStatus
  startDate: string
  endDate: string
  options: Opcao[]
  totalVotes: number
  userVoted: boolean
  userVote?: string | null
}

interface EnquetesResponse {
  items: Enquete[]
  activeCount: number
}

const statusConfig = {
  ativa: { label: "Ativa", color: "bg-green-100 text-green-700 border-green-300" },
  encerrada: { label: "Encerrada", color: "bg-gray-100 text-gray-700 border-gray-300" },
}

export default function EnquetesPage() {
  const [enquetes, setEnquetes] = useState<Enquete[]>([])
  const [selectedEnqueteId, setSelectedEnqueteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<EnqueteStatus | "todas">("todas")
  const [activeCount, setActiveCount] = useState(0)

  const loadEnquetes = async () => {
    try {
      const data = await apiGet<EnquetesResponse>("/api/enquetes")
      setEnquetes(data.items)
      setActiveCount(data.activeCount)
      if (!selectedEnqueteId && data.items.length > 0) {
        setSelectedEnqueteId(data.items[0].id)
      }
    } catch (error) {
      console.error("Erro ao carregar enquetes:", error)
    }
  }

  useEffect(() => {
    void loadEnquetes()
  }, [])

  const filteredEnquetes = useMemo(
    () => enquetes.filter((e) => (filter === "todas" ? true : e.status === filter)),
    [enquetes, filter]
  )

  const selectedEnquete = enquetes.find((e) => e.id === selectedEnqueteId) ?? null

  const handleVote = async (enqueteId: string, optionId: string) => {
    try {
      const updated = await apiSend<Enquete>(`/api/enquetes/${enqueteId}/vote`, "POST", { optionId })
      setEnquetes((prev) => prev.map((item) => (item.id === enqueteId ? updated : item)))
      setSelectedEnqueteId(enqueteId)
    } catch (error) {
      console.error("Erro ao votar:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="enquetes" />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Enquetes e Votacoes</h1>
              <p className="text-sm text-muted-foreground">{activeCount > 0 ? `${activeCount} enquete(s) ativa(s)` : "Nenhuma enquete ativa no momento"}</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-2">
            {(["todas", "ativa", "encerrada"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="rounded-sm border-2 border-foreground">
                {f === "todas" ? "Todas" : statusConfig[f as EnqueteStatus].label}
              </Button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-3">
            {filteredEnquetes.length > 0 ? (
              filteredEnquetes.map((enquete) => (
                <Card
                  key={enquete.id}
                  onClick={() => setSelectedEnqueteId(enquete.id)}
                  className={`cursor-pointer border-2 border-foreground rounded-sm transition-all hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground ${selectedEnqueteId === enquete.id ? "shadow-[3px_3px_0px_0px] shadow-foreground bg-secondary" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-semibold text-foreground">{enquete.title}</h4>
                          <Badge className={`text-xs rounded-sm border ${statusConfig[enquete.status].color}`}>{statusConfig[enquete.status].label}</Badge>
                          {enquete.userVoted && (
                            <Badge className="text-xs rounded-sm border bg-blue-100 text-blue-700 border-blue-300">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Votou
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{enquete.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {enquete.totalVotes} votos
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Ate {new Date(enquete.endDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">Nenhuma enquete encontrada para este filtro.</div>
            )}
          </section>

          <aside>
            {selectedEnquete ? (
              <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground sticky top-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-xs rounded-sm border ${statusConfig[selectedEnquete.status].color}`}>{statusConfig[selectedEnquete.status].label}</Badge>
                    {selectedEnquete.userVoted && (
                      <Badge className="text-xs rounded-sm border bg-blue-100 text-blue-700 border-blue-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Votou
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{selectedEnquete.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{selectedEnquete.description}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedEnquete.startDate).toLocaleDateString("pt-BR")} - {new Date(selectedEnquete.endDate).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedEnquete.totalVotes} votos
                    </span>
                  </div>

                  <div className="border-t-2 border-foreground pt-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Opcoes</p>

                    {selectedEnquete.options.map((option) => {
                      const percentage = selectedEnquete.totalVotes > 0 ? Math.round((option.votes / selectedEnquete.totalVotes) * 100) : 0
                      const isUserVote = selectedEnquete.userVote === option.id
                      const showResults = selectedEnquete.userVoted || selectedEnquete.status === "encerrada"

                      return (
                        <div key={option.id} className="space-y-1">
                          {!showResults && selectedEnquete.status === "ativa" ? (
                            <Button variant="outline" className="w-full justify-start border-2 border-foreground rounded-sm" onClick={() => void handleVote(selectedEnquete.id, option.id)}>
                              <Vote className="h-4 w-4 mr-2" />
                              {option.text}
                            </Button>
                          ) : (
                            <div className={`relative border-2 border-foreground rounded-sm p-3 overflow-hidden ${isUserVote ? "bg-blue-50" : ""}`}>
                              <div className="absolute inset-0 bg-primary/10" style={{ width: `${percentage}%` }} />
                              <div className="relative flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                                  {option.text}
                                  {isUserVote && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                                </span>
                                <span className="text-sm font-bold text-foreground">{percentage}%</span>
                              </div>
                              <p className="relative text-xs text-muted-foreground mt-1">{option.votes} voto(s)</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground rounded-sm">
                <CardContent className="p-5 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione uma enquete para votar ou ver resultados</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
