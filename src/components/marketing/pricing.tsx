import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { plans } from "@/config/site"
import { cn } from "@/lib/utils"

export function Pricing({ heading = true }: { heading?: boolean }) {
  return (
    <section id="precos" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6">
      {heading && (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">Preços</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Simples, transparente, justo
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Comece grátis. Evolua quando o time crescer.</p>
        </div>
      )}
      <div className="mx-auto mt-14 grid max-w-6xl items-start gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.id}
            className={cn(
              "relative flex h-full flex-col rounded-2xl border bg-card p-7",
              p.highlight &&
                "border-foreground/80 shadow-[0_24px_60px_-28px_rgb(0_0_0/0.35)] ring-1 ring-foreground/80 lg:-mt-4 lg:pb-11",
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-7 rounded-full bg-foreground px-2.5 py-0.5 text-xs font-medium text-background">
                Mais popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              {p.priceMonthly === null ? (
                <span className="text-4xl font-semibold tracking-tight">Sob consulta</span>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-5xl font-semibold tabular tracking-tight">{p.priceMonthly}</span>
                  <span className="text-sm text-muted-foreground">/usuário/mês</span>
                </>
              )}
            </div>
            <Button
              asChild
              size="lg"
              variant={p.highlight ? "default" : "outline"}
              className="mt-6 h-10 w-full"
            >
              <Link href={p.id === "enterprise" ? "mailto:vendas@vertice.app" : "/signup"}>{p.cta}</Link>
            </Button>
            <ul className="mt-7 space-y-3 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
