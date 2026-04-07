"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Home, Car, UserPlus, Phone, Mail, ChevronRight } from "lucide-react"
import { apiGet } from "@/lib/api"

interface Morador {
  id: string
  name: string
  unit: string
  block: string
  phone: string
  email: string
  type: "proprietario" | "inquilino"
  vehicles: { plate: string; model: string }[]
}

interface MoradoresResponse {
  items: Morador[]
  summary: {
    totalMoradores: number
    blocks: string[]
    totalVehicles: number
  }
}

const typeConfig = {
  proprietario: { label: "Proprietario", color: "bg-blue-100 text-blue-700 border-blue-300" },
  inquilino: { label: "Inquilino", color: "bg-purple-100 text-purple-700 border-purple-300" },
}

export default function MoradoresPage() {
  const [moradores, setMoradores] = useState<Morador[]>([])
  const [selectedMoradorId, setSelectedMoradorId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBlock, setFilterBlock] = useState<string | "todos">("todos")
  const [summary, setSummary] = useState({ totalMoradores: 0, blocks: [] as string[], totalVehicles: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim())
        }
        if (filterBlock !== "todos") {
          params.set("block", filterBlock)
        }

        const query = params.toString()
        const data = await apiGet<MoradoresResponse>(`/api/moradores${query ? `?${query}` : ""}`)
        setMoradores(data.items)
        setSummary(data.summary)
        if (data.items.length > 0 && !data.items.some((m) => m.id === selectedMoradorId)) {
          setSelectedMoradorId(data.items[0].id)
        }
        if (data.items.length === 0) {
          setSelectedMoradorId(null)
        }
      } catch (error) {
        console.error("Erro ao carregar moradores:", error)
      }
    }

    void load()
  }, [searchTerm, filterBlock, selectedMoradorId])

  const selectedMorador = useMemo(
    () => moradores.find((m) => m.id === selectedMoradorId) ?? null,
    [moradores, selectedMoradorId]
  )

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="moradores" />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Moradores</h1>
                <p className="text-sm text-muted-foreground">{summary.totalMoradores} moradores cadastrados</p>
              </div>
            </div>
            <Button className="border-2 border-foreground rounded-sm gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrar Visitante
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-secondary flex items-center justify-center">
                <Users className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.totalMoradores}</p>
                <p className="text-xs text-muted-foreground">Moradores</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-secondary flex items-center justify-center">
                <Home className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.blocks.length}</p>
                <p className="text-xs text-muted-foreground">Blocos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-foreground rounded-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-secondary flex items-center justify-center">
                <Car className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.totalVehicles}</p>
                <p className="text-xs text-muted-foreground">Veiculos</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, apartamento ou placa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-2 border-foreground rounded-sm" />
          </div>
          <div className="flex gap-2">
            <Button variant={filterBlock === "todos" ? "default" : "outline"} size="sm" onClick={() => setFilterBlock("todos")} className="rounded-sm border-2 border-foreground">Todos</Button>
            {summary.blocks.map((block) => (
              <Button key={block} variant={filterBlock === block ? "default" : "outline"} size="sm" onClick={() => setFilterBlock(block)} className="rounded-sm border-2 border-foreground">
                Bloco {block}
              </Button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="space-y-3">
            {moradores.length > 0 ? (
              moradores.map((morador) => (
                <Card
                  key={morador.id}
                  onClick={() => setSelectedMoradorId(morador.id)}
                  className={`cursor-pointer border-2 border-foreground rounded-sm transition-all hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground ${selectedMoradorId === morador.id ? "shadow-[3px_3px_0px_0px] shadow-foreground bg-secondary" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-primary flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-foreground">{morador.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{morador.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">Bloco {morador.block} - Ap. {morador.unit}</span>
                            <Badge className={`text-xs rounded-sm border ${typeConfig[morador.type].color}`}>{typeConfig[morador.type].label}</Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">Nenhum morador encontrado.</div>
            )}
          </section>

          <aside>
            {selectedMorador ? (
              <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground sticky top-4">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-14 w-14 rounded-sm border-2 border-foreground bg-primary flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">{selectedMorador.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedMorador.name}</h3>
                      <Badge className={`text-xs rounded-sm border ${typeConfig[selectedMorador.type].color}`}>{typeConfig[selectedMorador.type].label}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm border-t-2 border-foreground pt-4">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">Bloco {selectedMorador.block} - Ap. {selectedMorador.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedMorador.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedMorador.email}</span>
                    </div>
                  </div>

                  {selectedMorador.vehicles.length > 0 && (
                    <div className="border-t-2 border-foreground pt-4 mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                        <Car className="h-3 w-3" /> Veiculos ({selectedMorador.vehicles.length})
                      </p>
                      <ul className="space-y-2">
                        {selectedMorador.vehicles.map((v, i) => (
                          <li key={i} className="text-sm text-foreground bg-secondary p-2 rounded-sm border border-foreground">
                            <span className="font-semibold">{v.plate}</span>
                            <br />
                            <span className="text-muted-foreground">{v.model}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed border-muted-foreground rounded-sm">
                <CardContent className="p-5 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione um morador para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
