import { Star } from "lucide-react"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const items = [
  {
    quote:
      "Trocamos três ferramentas e uma planilha gigante pelo Vértice. Em um mês o time inteiro estava usando sem eu precisar cobrar.",
    name: "Mariana Costa",
    role: "Head de Vendas, Nimbus",
    featured: true,
  },
  {
    quote: "O kanban é absurdamente rápido. Reunião de pipeline caiu de 1h para 20 minutos.",
    name: "Rafael Souza",
    role: "Diretor Comercial, Orbe",
  },
  {
    quote: "Finalmente enxergo o forecast real, ponderado por estágio, sem montar relatório na mão.",
    name: "Ana Lima",
    role: "CEO, Kappa Log",
  },
  {
    quote: "Os lembretes de follow-up salvaram negócios que iam esfriar. Paga-se no primeiro mês.",
    name: "João Pereira",
    role: "SDR Lead, Solaris",
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium text-brand">Depoimentos</p>
        <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Times que vendem mais com o Vértice
        </h2>
      </div>
      <div className="mt-14 grid gap-4 md:grid-cols-3 md:grid-rows-2">
        {items.map((t) => (
          <figure
            key={t.name}
            className={cn(
              "flex flex-col rounded-2xl border bg-card p-6",
              t.featured &&
                "bg-gradient-to-br from-brand-soft via-card to-card md:row-span-2 md:p-8 dark:from-brand/15",
            )}
          >
            <div className="flex gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </div>
            <blockquote
              className={cn(
                "mt-4 flex-1 text-pretty leading-relaxed",
                t.featured ? "text-xl font-medium tracking-tight md:text-2xl" : "text-sm text-muted-foreground",
              )}
            >
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-foreground text-xs font-semibold text-background">
                {initials(t.name)}
              </span>
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
