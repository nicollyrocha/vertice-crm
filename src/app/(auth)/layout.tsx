import { Star } from "lucide-react"
import { Logo } from "@/components/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px] animate-fade-up">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          Protegido com criptografia de ponta a ponta · LGPD
        </p>
      </div>

      <aside className="relative hidden overflow-hidden bg-zinc-950 text-zinc-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [--foreground:white] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-violet-600/40 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-10 h-[320px] w-[320px] rounded-full bg-sky-500/20 blur-[120px]" />

        <div className="relative ml-auto w-full max-w-md space-y-3">
          {[
            { t: "Onboarding Enterprise — Orbe", v: "R$ 120.000", s: "Negociação", c: "bg-amber-400" },
            { t: "Licença anual — Nimbus", v: "R$ 36.000", s: "Ganho", c: "bg-emerald-400" },
            { t: "Expansão time LATAM", v: "R$ 48.000", s: "Proposta", c: "bg-violet-400" },
          ].map((d, i) => (
            <div
              key={d.t}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
              style={{ marginLeft: `${i * 28}px` }}
            >
              <div>
                <div className="text-sm font-medium">{d.t}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className={`size-1.5 rounded-full ${d.c}`} /> {d.s}
                </div>
              </div>
              <div className="text-sm font-semibold tabular">{d.v}</div>
            </div>
          ))}
        </div>

        <figure className="relative max-w-lg">
          <div className="flex gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <blockquote className="mt-4 text-balance text-2xl font-medium leading-snug tracking-tight">
            “Em um mês o time inteiro estava usando sem eu precisar cobrar. Nossa conversão subiu 32%.”
          </blockquote>
          <figcaption className="mt-5 text-sm text-zinc-400">Mariana Costa · Head de Vendas, Nimbus</figcaption>
        </figure>
      </aside>
    </div>
  )
}
