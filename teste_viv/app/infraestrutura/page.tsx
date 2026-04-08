import Link from "next/link"
import { ArrowLeft, Building2 } from "lucide-react"
import { InfrastructureSection } from "@/components/infrastructure-section"

export default function InfraestruturaPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-primary">CONDOMÍNIO VIVA</p>
              <p className="text-xs text-muted-foreground">Arquitetura de Lazer</p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para home
          </Link>
        </header>

        <section className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-accent">AMBIENTES DO CONDOMÍNIO</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight md:text-5xl">Conheça nossa infraestrutura</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
            Explore os espaços do Condomínio VIVA. Quando estiver logado como administrador, você poderá cadastrar,
            editar e remover os itens desta galeria.
          </p>
        </section>

        <InfrastructureSection />
      </div>
    </main>
  )
}
