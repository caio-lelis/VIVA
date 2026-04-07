"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Download, Calendar, Droplet, Zap, Wrench, DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react"
import { apiGet } from "@/lib/api"

interface Relatorio {
  id: string
  title: string
  description: string
  category: "consumo" | "financeiro" | "manutencao"
  period: string
  generatedAt: string
}

interface ConsumoData {
  month: string
  agua: number
  energia: number
}

interface VisaoGeral {
  stats: {
    aguaAtual: number
    aguaVariacaoPct: number
    energiaAtual: number
    energiaVariacaoPct: number
    manutencoesMes: number
    saldoCaixa: number
  }
  consumo: ConsumoData[]
}

const categoryConfig = {
  consumo: { icon: Droplet, color: "bg-blue-100 text-blue-700 border-blue-300" },
  financeiro: { icon: DollarSign, color: "bg-green-100 text-green-700 border-green-300" },
  manutencao: { icon: Wrench, color: "bg-orange-100 text-orange-700 border-orange-300" },
}

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [visaoGeral, setVisaoGeral] = useState<VisaoGeral | null>(null)
  const [activeTab, setActiveTab] = useState<"visao-geral" | "relatorios">("visao-geral")

  useEffect(() => {
    const load = async () => {
      try {
        const [relatoriosRes, visaoRes] = await Promise.all([
          apiGet<{ items: Relatorio[] }>("/api/relatorios"),
          apiGet<VisaoGeral>("/api/relatorios/visao-geral"),
        ])
        setRelatorios(relatoriosRes.items)
        setVisaoGeral(visaoRes)
      } catch (error) {
        console.error("Erro ao carregar relatorios:", error)
      }
    }

    void load()
  }, [])

  const consumoData = visaoGeral?.consumo ?? []
  const maxAgua = useMemo(() => Math.max(...consumoData.map((d) => d.agua), 1), [consumoData])
  const maxEnergia = useMemo(() => Math.max(...consumoData.map((d) => d.energia), 1), [consumoData])

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="relatorios" />

      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Relatorios</h1>
              <p className="text-sm text-muted-foreground">Visualize metricas e baixe relatorios do condominio</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex gap-2">
            <Button variant={activeTab === "visao-geral" ? "default" : "outline"} onClick={() => setActiveTab("visao-geral")} className="rounded-sm border-2 border-foreground">Visao Geral</Button>
            <Button variant={activeTab === "relatorios" ? "default" : "outline"} onClick={() => setActiveTab("relatorios")} className="rounded-sm border-2 border-foreground">Relatorios</Button>
          </div>
        </section>

        {activeTab === "visao-geral" && visaoGeral && (
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Agua (m3)</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{visaoGeral.stats.aguaAtual}</p>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${visaoGeral.stats.aguaVariacaoPct < 0 ? "text-green-600" : "text-red-600"}`}>
                        {visaoGeral.stats.aguaVariacaoPct < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {Math.abs(visaoGeral.stats.aguaVariacaoPct).toFixed(1)}% vs mes anterior
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-blue-100 flex items-center justify-center">
                      <Droplet className="h-5 w-5 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Energia (kWh)</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{visaoGeral.stats.energiaAtual}</p>
                      <div className={`flex items-center gap-1 text-xs mt-1 ${visaoGeral.stats.energiaVariacaoPct < 0 ? "text-green-600" : "text-red-600"}`}>
                        {visaoGeral.stats.energiaVariacaoPct < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                        {Math.abs(visaoGeral.stats.energiaVariacaoPct).toFixed(1)}% vs mes anterior
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-yellow-100 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Manutencoes</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{visaoGeral.stats.manutencoesMes}</p>
                      <p className="text-xs text-muted-foreground mt-1">no mes</p>
                    </div>
                    <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-orange-100 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-orange-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Saldo</p>
                      <p className="text-2xl font-bold text-foreground mt-1">R$ {visaoGeral.stats.saldoCaixa.toLocaleString("pt-BR")}</p>
                      <p className="text-xs text-muted-foreground mt-1">caixa atual</p>
                    </div>
                    <div className="h-10 w-10 rounded-sm border-2 border-foreground bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      Consumo de Agua
                    </h3>
                    <span className="text-xs text-muted-foreground">Ultimos 6 meses</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {consumoData.map((d) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-blue-500 rounded-t-sm border-2 border-foreground" style={{ height: `${(d.agua / maxAgua) * 100}%` }} />
                        <span className="text-xs text-muted-foreground">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      Consumo de Energia
                    </h3>
                    <span className="text-xs text-muted-foreground">Ultimos 6 meses</span>
                  </div>
                  <div className="flex items-end gap-2 h-40">
                    {consumoData.map((d) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-yellow-500 rounded-t-sm border-2 border-foreground" style={{ height: `${(d.energia / maxEnergia) * 100}%` }} />
                        <span className="text-xs text-muted-foreground">{d.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "relatorios" && (
          <section className="space-y-3">
            {relatorios.map((relatorio) => {
              const category = categoryConfig[relatorio.category]
              const CategoryIcon = category.icon

              return (
                <Card key={relatorio.id} className="border-2 border-foreground rounded-sm hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-sm border-2 border-foreground flex items-center justify-center ${category.color.split(" ")[0]}`}>
                          <CategoryIcon className={`h-6 w-6 ${category.color.split(" ")[1]}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{relatorio.title}</h4>
                          <p className="text-sm text-muted-foreground">{relatorio.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {relatorio.period}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Gerado em {new Date(relatorio.generatedAt).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button size="sm" className="border-2 border-foreground rounded-sm gap-1">
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        )}
      </main>
    </div>
  )
}
