import { Check } from "lucide-react"

const steps = [
  {
    n: "01",
    title: "Crie seu workspace",
    body: "Cadastre-se em segundos. Já entregamos um pipeline pronto, que você ajusta ao seu processo.",
  },
  {
    n: "02",
    title: "Traga seu time e seus clientes",
    body: "Convide vendedores por email e cadastre empresas, contatos e oportunidades.",
  },
  {
    n: "03",
    title: "Feche e acompanhe",
    body: "Mova negócios, agende follow-ups e acompanhe receita e conversão em tempo real.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative scroll-mt-20 overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] [--foreground:white] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute -right-40 top-0 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-violet-300">Como funciona</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Do cadastro ao primeiro negócio fechado em uma tarde.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {["Sem implantação", "Sem planilhas de importação obrigatórias", "Sem contrato de fidelidade"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-violet-500/20 text-violet-300">
                  <Check className="size-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              ["+32%", "taxa de conversão"],
              ["6h", "economizadas por semana"],
              ["4,9/5", "avaliação média"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-2xl font-semibold tabular tracking-tight sm:text-3xl">{v}</dt>
                <dd className="mt-1 text-xs text-zinc-400">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ol className="relative space-y-4">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex items-start gap-5">
                <span className="font-mono text-sm text-violet-300">{s.n}</span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
