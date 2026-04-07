"use client"

import Link from "next/link"
import { Building2, Menu, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "morador"

const navLinks = [
  { href: "/sistema", label: "Início", key: "inicio", adminOnly: false },
  { href: "/upload", label: "Documentos", key: "documentos", adminOnly: false },
  { href: "/avisos", label: "Avisos", key: "avisos", adminOnly: false },
  { href: "/chamados", label: "Suporte", key: "suporte", adminOnly: false },
  { href: "/financeiro", label: "Financeiro", key: "financeiro", adminOnly: true },
  { href: "/moradores", label: "Moradores", key: "moradores", adminOnly: true },
  { href: "/relatorios", label: "Relatórios", key: "relatorios", adminOnly: true },
]

interface HeaderProps {
  activePage?: string
}

export function Header({ activePage }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadRole = async () => {
      try {
        const response = await fetch("/api/auth/session")
        if (!response.ok) return
        const payload = await response.json()
        if (payload?.role === "admin" || payload?.role === "morador") {
          setRole(payload.role)
        }
      } catch {
        // Ignora falha de leitura de sessão no header.
      }
    }

    void loadRole()
  }, [])

  const visibleLinks = useMemo(() => {
    return navLinks.filter((link) => !link.adminOnly || role === "admin")
  }, [role])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="border-b-2 border-foreground bg-card">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/sistema" className="flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border-2 border-foreground bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-foreground leading-none">
                Portal do Condomínio
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                VIVA - Arquitetura de Lazer
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {visibleLinks.map((link) => {
              const isActive = activePage === link.key
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={[
                    "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "border-2 border-foreground bg-primary text-primary-foreground shadow-[2px_2px_0px_0px] shadow-foreground"
                      : "text-foreground hover:text-accent",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="rounded-sm px-3 py-1.5 text-sm font-medium text-foreground hover:text-accent"
              type="button"
            >
              Sair
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-sm border-2 border-foreground bg-secondary md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="mt-3 flex flex-col gap-1 border-t-2 border-foreground pt-3 md:hidden">
            {visibleLinks.map((link) => {
              const isActive = activePage === link.key
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "border-2 border-foreground bg-primary text-primary-foreground"
                      : "text-foreground hover:text-accent",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setMenuOpen(false)
                void handleLogout()
              }}
              className="rounded-sm px-3 py-2 text-left text-sm font-medium text-foreground hover:text-accent"
              type="button"
            >
              Sair
            </button>
          </nav>
        )}
      </div>
    </header>
  )
}
