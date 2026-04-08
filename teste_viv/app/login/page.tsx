"use client"

import { FormEvent, Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Building2, Lock, UserRound } from "lucide-react"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const requestedNextPath = searchParams.get("next")

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        setError(payload.error || "Falha no login")
        return
      }

      const payload = await response.json().catch(() => ({}))
      const role = payload?.role === "admin" ? "admin" : "morador"
      const destination = requestedNextPath || (role === "admin" ? "/infraestrutura" : "/sistema")

      router.push(destination)
      router.refresh()
    } catch {
      setError("Não foi possível conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1fr_420px]">
        <section className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" /> Voltar para a home
          </Link>
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">ACESSO AO PORTAL</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
            Bem-vindo ao sistema do Condomínio VIVA.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Entre para acessar serviços, comunicados e módulos administrativos com segurança.
          </p>
          <div className="grid max-w-xl gap-3 sm:grid-cols-3">
            {[
              { label: "Disponibilidade", value: "24h" },
              { label: "Perfil", value: "Morador/Admin" },
              { label: "Ambiente", value: "Seguro" },
            ].map((item) => (
              <article key={item.label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-base font-semibold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.12em] text-primary">CONDOMÍNIO VIVA</p>
              <p className="text-xs text-muted-foreground">Arquitetura de Lazer</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold">Entrar no portal</h2>
          <p className="mt-1 text-sm text-muted-foreground">Informe usuário e senha.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-muted-foreground">USUÁRIO</span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
                  placeholder="Seu usuário"
                  autoComplete="username"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-muted-foreground">SENHA</span>
              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/80"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="rounded-lg border border-destructive/30 bg-red-50 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar no sistema"}
            </button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground">
            Acesso inicial: morador (`morador` / `viva2026`) e administrador (`admin` / `admin123`).
          </p>
        </section>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  )
}
