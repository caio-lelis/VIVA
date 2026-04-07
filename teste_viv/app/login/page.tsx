"use client"

import { FormEvent, Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Playfair_Display, Manrope } from "next/font/google"
import { Building2, Lock, UserRound, ArrowLeft } from "lucide-react"

const headingFont = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] })
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const nextPath = searchParams.get("next") || "/sistema"

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

      router.push(nextPath)
      router.refresh()
    } catch {
      setError("Nao foi possivel conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-slate-950 text-slate-50`}>
      <div className="absolute inset-0 bg-[url('/img/viva-sobre.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,15,25,0.93)_0%,rgba(8,15,25,0.75)_48%,rgba(8,15,25,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(236,192,120,0.2)_0%,transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10 md:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-white/20 bg-white/7 p-6 backdrop-blur-md md:p-9">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-200 transition hover:text-amber-100"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para a home
            </Link>

            <p className="mt-6 text-xs font-semibold tracking-[0.3em] text-amber-200">PORTAL VIVA</p>
            <h1 className={`${headingFont.className} mt-2 text-4xl leading-tight text-white md:text-5xl`}>
              Bem-vindo ao sistema do Condominio VIVA
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200/85">
              Entre para acessar comunicados, reservas, chamados, relatorios e todo o fluxo administrativo em um unico portal.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Acesso", value: "24h" },
                { label: "Modulos", value: "8+" },
                { label: "Suporte", value: "Online" },
              ].map((item) => (
                <article key={item.label} className="rounded-xl border border-white/20 bg-slate-900/45 p-4">
                  <p className="text-lg font-bold text-amber-100">{item.value}</p>
                  <p className="text-sm text-slate-200/80">{item.label}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/20 bg-slate-900/70 p-6 backdrop-blur-md md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-slate-900">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-amber-200">CONDOMINIO VIVA</p>
                <p className="text-xs text-slate-300">Arquitetura de Lazer</p>
              </div>
            </div>

            <h2 className={`${headingFont.className} text-3xl text-white`}>Acesso ao Portal</h2>
            <p className="mt-1 text-sm text-slate-300">Informe seu usuario e senha para entrar.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold tracking-[0.22em] text-slate-300">USUARIO</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3">
                  <UserRound className="h-4 w-4 text-slate-300" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-300/75"
                    placeholder="Seu usuario"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold tracking-[0.22em] text-slate-300">SENHA</span>
                <div className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3">
                  <Lock className="h-4 w-4 text-slate-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-300/75"
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              {error && <p className="rounded-xl border border-red-300/60 bg-red-500/20 px-3 py-2 text-sm text-red-100">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-amber-300 text-sm font-bold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </button>
            </form>

            <p className="mt-5 text-xs text-slate-300/80">
              Ambiente inicial: morador (`morador` / `viva2026`) e administrador (`admin` / `admin123`).
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <LoginContent />
    </Suspense>
  )
}
