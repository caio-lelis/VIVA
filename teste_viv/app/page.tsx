import Link from "next/link"
import { Playfair_Display, Manrope } from "next/font/google"
import { ArrowRight, Building2, MapPin } from "lucide-react"

const headingFont = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"] })
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const vivaAddress =
  "1ª Avenida Sul Centro Urbano Quadra 101 Cj. 03 3 lote 16 a 20 - Samambaia, Brasília - DF, 72300-505"
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=1%C2%AA+Avenida+Sul+Centro+Urbano+Quadra+101+Cj.+03+3+lote+16+a+20+-+Samambaia%2C+Bras%C3%ADlia+-+DF%2C+72300-505"
const mapsEmbedUrl =
  "https://www.google.com/maps?q=1%C2%AA+Avenida+Sul+Centro+Urbano+Quadra+101+Cj.+03+3+lote+16+a+20+-+Samambaia%2C+Bras%C3%ADlia+-+DF%2C+72300-505&output=embed"

export default function HomePage() {
  return (
    <main className={`${bodyFont.className} relative min-h-screen overflow-hidden bg-slate-950 text-slate-50`}>
      <div className="absolute inset-0 bg-[url('/img/viva-sobre.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,15,25,0.9)_0%,rgba(8,15,25,0.7)_48%,rgba(8,15,25,0.9)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,192,120,0.22)_0%,transparent_36%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 md:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-slate-900">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-amber-200">CONDOMINIO VIVA</p>
              <p className="text-xs text-slate-200/80">Arquitetura de Lazer</p>
            </div>
          </div>

          <Link
            href="/login"
            className="rounded-xl border border-amber-200/70 bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
          >
            Entrar
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-9 md:py-12">
          <article className="mx-auto w-full max-w-4xl rounded-3xl border border-white/20 bg-slate-900/45 p-7 text-center backdrop-blur-md md:p-10">
            <p className="text-xs font-semibold tracking-[0.28em] text-amber-200">PORTAL DIGITAL</p>
            <h1 className={`${headingFont.className} mt-3 text-4xl leading-tight text-white md:text-6xl`}>
              Viva a rotina do condomínio com mais clareza e agilidade.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200/85 md:text-lg">
              Comunicados, reservas, chamados e relatórios em um ambiente único para moradores e administração.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-300 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
              >
                Acessar sistema <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#chegar-viva"
                className="inline-flex items-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Chegar até o VIVA
              </a>
            </div>
          </article>
        </section>

        <section id="chegar-viva" className="pb-8 md:pb-10">
          <article className="grid overflow-hidden rounded-3xl border border-white/20 bg-slate-900/55 backdrop-blur-md md:grid-cols-[1fr_1.2fr]">
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold tracking-[0.25em] text-amber-200">LOCALIZACAO</p>
              <h2 className={`${headingFont.className} mt-2 text-3xl text-white md:text-4xl`}>Chegar até o VIVA</h2>

              <div className="mt-5 flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-300 text-slate-900">
                  <MapPin className="h-4 w-4" />
                </div>
                <p className="text-sm leading-6 text-slate-200">{vivaAddress}</p>
              </div>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-200"
              >
                Abrir no Google Maps
              </a>
            </div>

            <div className="min-h-[280px] border-t border-white/20 md:min-h-full md:border-l md:border-t-0">
              <iframe
                title="Localização do Condomínio VIVA"
                src={mapsEmbedUrl}
                className="h-full min-h-[280px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}
