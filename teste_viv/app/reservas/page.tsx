"use client"

import { useEffect, useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Users, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { apiGet, apiSend } from "@/lib/api"

interface Espaco {
  id: string
  name: string
  description: string
  capacity: number
  rules: string[]
}

interface Reserva {
  id: string
  espacoId: string
  date: string
  startTime: string
  endTime: string
  status: "confirmada" | "pendente" | "cancelada"
  unit: string
}

const statusConfig = {
  confirmada: { label: "Confirmada", color: "bg-green-100 text-green-700 border-green-300" },
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-700 border-red-300" },
}

const USER_UNIT = "Ap. 204"

export default function ReservasPage() {
  const [espacos, setEspacos] = useState<Espaco[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [selectedEspaco, setSelectedEspaco] = useState<Espaco | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const loadData = async () => {
    try {
      const [espacosRes, reservasRes] = await Promise.all([
        apiGet<{ items: Espaco[] }>("/api/reservas/espacos"),
        apiGet<{ items: Reserva[] }>("/api/reservas"),
      ])
      setEspacos(espacosRes.items)
      setReservas(reservasRes.items)
      if (!selectedEspaco && espacosRes.items.length > 0) {
        setSelectedEspaco(espacosRes.items[0])
      }
    } catch (error) {
      console.error("Erro ao carregar reservas:", error)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const currentMonth = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))
  }

  const getReservasForDate = (day: number) => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return reservas.filter((r) => r.date === dateStr)
  }

  const minhasReservas = useMemo(() => reservas.filter((r) => r.unit === USER_UNIT), [reservas])

  const solicitarReserva = async () => {
    if (!selectedEspaco) {
      return
    }

    const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`

    try {
      const created = await apiSend<Reserva>("/api/reservas", "POST", {
        espacoId: selectedEspaco.id,
        date,
        startTime: "18:00",
        endTime: "20:00",
        unit: USER_UNIT,
      })
      setReservas((prev) => [...prev, created])
    } catch (error) {
      console.error("Erro ao solicitar reserva:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="reservas" />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
              <CalendarDays className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reservas de Espacos</h1>
              <p className="text-sm text-muted-foreground">Reserve saloes, churrasqueiras, quadras e outros espacos</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Espacos disponiveis</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {espacos.map((espaco) => (
                  <Card
                    key={espaco.id}
                    onClick={() => setSelectedEspaco(espaco)}
                    className={`cursor-pointer border-2 border-foreground rounded-sm transition-all hover:shadow-[3px_3px_0px_0px] hover:shadow-foreground ${selectedEspaco?.id === espaco.id ? "shadow-[3px_3px_0px_0px] shadow-foreground bg-secondary" : ""}`}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-1">{espaco.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{espaco.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {espaco.capacity} pessoas
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <Card className="border-2 border-foreground rounded-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground capitalize">{currentMonth}</h3>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 border-2 border-foreground rounded-sm">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 border-2 border-foreground rounded-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                      <div key={day} className="text-xs font-semibold text-muted-foreground py-2">{day}</div>
                    ))}

                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1
                      const dayReservas = getReservasForDate(day)
                      const isToday =
                        day === new Date().getDate() &&
                        selectedDate.getMonth() === new Date().getMonth() &&
                        selectedDate.getFullYear() === new Date().getFullYear()

                      return (
                        <div key={day} className={`relative p-2 text-sm rounded-sm border transition-all cursor-pointer hover:bg-secondary ${isToday ? "border-2 border-accent font-bold" : "border-transparent"}`}>
                          {day}
                          {dayReservas.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {dayReservas.slice(0, 3).map((r) => (
                                <span
                                  key={r.id}
                                  className={`h-1.5 w-1.5 rounded-full ${r.status === "confirmada" ? "bg-green-500" : r.status === "pendente" ? "bg-yellow-500" : "bg-red-500"}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <aside className="space-y-4">
            {selectedEspaco && (
              <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2">{selectedEspaco.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Users className="h-4 w-4" /> Capacidade: {selectedEspaco.capacity} pessoas
                  </div>
                  <div className="border-t-2 border-foreground pt-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Regras</p>
                    <ul className="space-y-1">
                      {selectedEspaco.rules.map((rule, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full mt-4 border-2 border-foreground rounded-sm" onClick={() => void solicitarReserva()}>Solicitar Reserva</Button>
                </CardContent>
              </Card>
            )}

            <Card className="border-2 border-foreground rounded-sm shadow-[3px_3px_0px_0px] shadow-foreground">
              <CardContent className="p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Minhas Reservas</h3>
                {minhasReservas.length > 0 ? (
                  <ul className="space-y-3">
                    {minhasReservas.map((reserva) => {
                      const espaco = espacos.find((e) => e.id === reserva.espacoId)
                      return (
                        <li key={reserva.id} className="border-b border-muted pb-3 last:border-0 last:pb-0">
                          <p className="font-medium text-foreground text-sm">{espaco?.name || reserva.espacoId}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <CalendarDays className="h-3 w-3" />
                            {new Date(reserva.date).toLocaleDateString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {reserva.startTime} - {reserva.endTime}
                          </p>
                          <Badge className={`mt-2 text-xs rounded-sm border ${statusConfig[reserva.status].color}`}>{statusConfig[reserva.status].label}</Badge>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Voce nao tem reservas.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
