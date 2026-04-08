"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import {
  FileUp,
  Bell,
  CalendarDays,
  Wrench,
  DollarSign,
  Users,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Image,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiGet } from "@/lib/api"

type ModuleItem = {
  href: string
  title: string
  description: string
  badge: string | null
  available: boolean
}

type ActivityItem = {
  title: string
  time: string
  type: "success" | "warning" | "info" | "neutral"
}

type DashboardResponse = {
  modules: ModuleItem[]
  recentActivity: ActivityItem[]
  summary: {
    unidades: number
    moradores: number
    chamadosAbertos: number
    documentos: number
  }
}
type Role = "admin" | "morador"

const adminOnlyModuleHrefs = new Set(["/financeiro", "/moradores", "/relatorios", "/infraestrutura"])

const defaultModules: ModuleItem[] = [
  { href: "/upload", title: "Documentos", description: "Envie e gerencie atas, contratos, boletos e demais arquivos do condomínio.", badge: null, available: true },
  { href: "/avisos", title: "Avisos e Comunicados", description: "Acesse os comunicados e notificações enviados pela administração.", badge: "3 novos", available: true },
  { href: "/reservas", title: "Reservas de Espaços", description: "Reserve salões, quadras e áreas de lazer com facilidade.", badge: null, available: true },
  { href: "/chamados", title: "Chamados de Manutenção", description: "Abra e acompanhe ordens de serviço para manutenções no condomínio.", badge: "1 aberto", available: true },
  { href: "/financeiro", title: "Financeiro", description: "Consulte boletos, extratos e a posição financeira da sua unidade.", badge: null, available: true },
  { href: "/moradores", title: "Moradores", description: "Diretório de moradores, visitantes autorizados e veículos cadastrados.", badge: null, available: true },
  { href: "/enquetes", title: "Enquetes e Votações", description: "Participe de enquetes e votações sobre decisões do condomínio.", badge: "1 ativa", available: true },
  { href: "/relatorios", title: "Relatórios", description: "Visualize relatórios de consumo, manutenções e outras métricas.", badge: null, available: true },
  { href: "/infraestrutura", title: "Infraestrutura da Home", description: "Gerencie imagens e descrições da página pública de infraestrutura.", badge: "admin", available: true },
]

const defaultActivity: ActivityItem[] = [
  { title: "Ata da Assembleia enviada", time: "Há 2 horas", type: "success" },
  { title: "Manutenção da bomba d'água agendada", time: "Há 1 dia", type: "warning" },
  { title: "Novo comunicado: Pintura do corredor", time: "Há 2 dias", type: "info" },
  { title: "Reserva do salão confirmada — Ap. 204", time: "Há 3 dias", type: "neutral" },
]

const iconByModule: Record<string, LucideIcon> = {
  "/upload": FileUp,
  "/avisos": Bell,
  "/reservas": CalendarDays,
  "/chamados": Wrench,
  "/financeiro": DollarSign,
  "/moradores": Users,
  "/enquetes": MessageSquare,
  "/relatorios": BarChart3,
  "/infraestrutura": Image,
}

const iconByActivityType: Record<ActivityItem["type"], { icon: LucideIcon; color: string }> = {
  success: { icon: CheckCircle2, color: "text-emerald-700" },
  warning: { icon: AlertCircle, color: "text-accent" },
  info: { icon: Bell, color: "text-primary" },
  neutral: { icon: Clock, color: "text-muted-foreground" },
}

export default function HubPage() {
  const [modules, setModules] = useState<ModuleItem[]>(defaultModules)
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(defaultActivity)
  const [summary, setSummary] = useState({ unidades: 48, moradores: 132, chamadosAbertos: 3, documentos: 27 })
  const [role, setRole] = useState<Role>("morador")
  const [acessoNegado, setAcessoNegado] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashboardResult, sessionResult] = await Promise.allSettled([
          apiGet<DashboardResponse>("/api/dashboard"),
          fetch("/api/auth/session"),
        ])

        if (dashboardResult.status === "fulfilled") {
          const data = dashboardResult.value
          setModules(data.modules)
          setRecentActivity(data.recentActivity)
          setSummary(data.summary)
        }

        if (sessionResult.status === "fulfilled" && sessionResult.value.ok) {
          const sessionData = await sessionResult.value.json()
          if (sessionData?.role === "admin" || sessionData?.role === "morador") {
            setRole(sessionData.role)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error)
      }
    }

    void load()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAcessoNegado(params.get("acesso") === "negado")
  }, [])

  const stats = useMemo(
    () => [
      { label: "Unidades", value: String(summary.unidades) },
      { label: "Moradores", value: String(summary.moradores) },
      { label: "Chamados abertos", value: String(summary.chamadosAbertos) },
      { label: "Documentos", value: String(summary.documentos) },
    ],
    [summary]
  )

  const modulesToDisplay = useMemo(() => {
    return modules.filter((module) => role === "admin" || !adminOnlyModuleHrefs.has(module.href))
  }, [modules, role])

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="inicio" />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <section className="mb-10 rounded-2xl border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Portal do Condomínio</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground text-balance md:text-4xl">Bem-vindo ao portal de serviços</h2>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">Acesse todos os serviços e funcionalidades do condomínio em um único ambiente.</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Perfil ativo: {role === "admin" ? "Administrador" : "Morador"}
          </p>
          {acessoNegado && (
            <p className="mt-3 rounded-lg border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
              Você não tem permissão para acessar esse módulo.
            </p>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Módulos disponíveis</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {modulesToDisplay.map((mod) => {
                const Icon = iconByModule[mod.href] || FileUp
                const card = (
                  <Card
                    key={mod.href}
                    className={[
                      "group rounded-xl border border-border bg-card py-0 shadow-sm transition-all duration-150",
                      mod.available
                        ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                        : "opacity-50 cursor-not-allowed",
                    ].join(" ")}
                  >
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        {mod.badge && <Badge className="rounded-md border border-border bg-secondary text-foreground text-xs font-semibold">{mod.badge}</Badge>}
                        {!mod.available && <span className="text-xs text-muted-foreground font-medium">Em breve</span>}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{mod.title}</h4>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mod.description}</p>
                      </div>
                      {mod.available && (
                        <div className="flex items-center gap-1 text-xs font-semibold text-accent group-hover:gap-2 transition-all">
                          Acessar <ArrowRight className="h-3 w-3" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )

                return mod.available ? (
                  <Link key={mod.href} href={mod.href} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {card}
                  </Link>
                ) : (
                  <div key={mod.href}>{card}</div>
                )
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <Card className="rounded-xl border border-border py-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Resumo do Condomínio</h3>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-xl font-bold text-foreground leading-none">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-snug">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border py-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Atividade Recente</h3>
                <ul className="flex flex-col gap-3">
                  {recentActivity.map((item) => {
                    const config = iconByActivityType[item.type] || iconByActivityType.neutral
                    const Icon = config.icon
                    return (
                      <li key={item.title} className="flex items-start gap-3">
                        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border bg-primary py-0 shadow-sm">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm font-semibold text-primary-foreground">Precisa de ajuda?</p>
                <p className="mt-1 text-xs text-primary-foreground/80 leading-relaxed">Entre em contato com a administração pelo ramal 100 ou pelo e-mail do condomínio.</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-md border border-primary-foreground/40 px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  Contato <ArrowRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} LegoTech. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  )
}
