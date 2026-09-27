import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductMock } from "./product-mock"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px] dark:bg-brand/30" />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <Link
          href="/#recursos"
          className="group mx-auto mb-7 inline-flex animate-fade-up items-center gap-2 rounded-full border bg-background/60 py-1 pl-1 pr-3 text-xs text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand">
            <Sparkles className="size-3" /> Novo
          </span>
          Dashboard de previsão de receita
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <h1 className="mx-auto max-w-4xl animate-fade-up text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.035em] [animation-delay:80ms] sm:text-6xl lg:text-7xl">
          <span className="text-gradient">Venda mais.</span>
          <br />
          Organize menos.
        </h1>
        <p className="mx-auto mt-6 max-w-xl animate-fade-up text-pretty text-base text-muted-foreground [animation-delay:160ms] sm:text-lg">
          O Vértice é o CRM que coloca pipeline, contatos e follow-ups no mesmo lugar, para seu time B2B focar no que
          fecha negócio.
        </p>
        <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
          <Button asChild size="lg" className="h-11 w-full px-5 text-[15px] sm:w-auto">
            <Link href="/signup">
              Começar grátis <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 w-full px-5 text-[15px] sm:w-auto">
            <Link href="/login?demo=1">Ver demonstração</Link>
          </Button>
        </div>
        <p className="mt-4 animate-fade-up text-xs text-muted-foreground [animation-delay:300ms]">
          Grátis para até 2 usuários · Sem cartão de crédito · Pronto em 2 minutos
        </p>

        <div className="relative mx-auto mt-16 max-w-6xl animate-fade-up [animation-delay:380ms] [perspective:2000px]">
          <div className="absolute inset-x-10 -bottom-10 top-10 -z-10 rounded-[2rem] bg-gradient-to-b from-brand/20 to-transparent blur-2xl" />
          <ProductMock className="origin-top [transform:rotateX(8deg)] transition-transform duration-700 hover:[transform:rotateX(0deg)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}
