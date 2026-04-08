import Link from "next/link"
import { ArrowRight, Building2, MapPin } from "lucide-react"

const vivaAddress =
  "1ª Avenida Sul Centro Urbano Quadra 101 Cj. 03 3 lote 16 a 20 - Samambaia, Brasília - DF, 72300-505"
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=1%C2%AA+Avenida+Sul+Centro+Urbano+Quadra+101+Cj.+03+3+lote+16+a+20+-+Samambaia%2C+Bras%C3%ADlia+-+DF%2C+72300-505"
const mapsEmbedUrl =
  "https://www.google.com/maps?q=1%C2%AA+Avenida+Sul+Centro+Urbano+Quadra+101+Cj.+03+3+lote+16+a+20+-+Samambaia%2C+Bras%C3%ADlia+-+DF%2C+72300-505&output=embed"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[url('/img/viva-sobre.jpg')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,248,0.92)_0%,rgba(250,250,248,0.98)_80%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
          <header className="flex items-center justify-between">
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
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-95"
            >
              Entrar
            </Link>
          </header>

          <article className="mt-16 max-w-3xl pb-16 md:mt-20 md:pb-20">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent">PORTAL INSTITUCIONAL</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
              Gestão condominial com clareza, segurança e organização.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Um ambiente único para moradores e administração acompanharem comunicados, reservas, chamados e rotinas
              financeiras com fluxo simples.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Acessar sistema <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/infraestrutura"
                className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground"
              >
                Conheça nossa infraestrutura
              </Link>
              <a
                href="#chegar-viva"
                className="inline-flex items-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground"
              >
                Chegar até o VIVA
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-4 pt-2 md:px-8 md:pb-8">
        <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-4 md:grid-cols-[1.15fr_1fr] md:p-6">
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src="/img/viva-sobre.jpg"
              alt="Vista do Condomínio VIVA"
              className="h-[280px] w-full object-cover md:h-[340px]"
              loading="lazy"
            />
          </div>
          <article className="px-1">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent">CONDOMÍNIO VIVA</p>
            <h2 className="mt-2 text-3xl font-semibold leading-tight">Um ambiente planejado para bem-estar e convivência.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              A imagem institucional do VIVA integra a experiência visual da plataforma para refletir o padrão do
              condomínio: organização, conforto e identidade.
            </p>
            <Link
              href="/infraestrutura"
              className="mt-5 inline-flex items-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground"
            >
              Ver ambientes e infraestrutura
            </Link>
          </article>
        </div>
      </section>

      <section id="chegar-viva" className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1fr_1.2fr]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] text-accent">LOCALIZAÇÃO</p>
            <h2 className="mt-2 text-3xl font-semibold">Chegar até o VIVA</h2>
            <div className="mt-5 flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <MapPin className="h-4 w-4" />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{vivaAddress}</p>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Abrir no Google Maps
            </a>
          </div>

          <div className="min-h-[300px] border-t border-border lg:border-l lg:border-t-0">
            <iframe
              title="Localização do Condomínio VIVA"
              src={mapsEmbedUrl}
              className="h-full min-h-[300px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  )
}
