import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute inset-0 bg-dots [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[600px] -translate-x-1/2 rounded-full bg-brand/30 blur-[100px]" />
        <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          Seu próximo trimestre começa hoje
        </h2>
        <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
          Crie sua conta grátis e tenha seu pipeline rodando antes do café esfriar.
        </p>
        <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 px-5 text-[15px]">
            <Link href="/signup">
              Criar conta grátis <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[15px]">
            <Link href="/pricing">Comparar planos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
