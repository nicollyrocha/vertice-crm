import { Bell, Building2, Command, KanbanSquare, LineChart, ShieldCheck, Users } from "lucide-react"
import { cn } from "@/lib/utils"

function Tile({
  className,
  icon: Icon,
  title,
  children,
  visual,
}: {
  className?: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  children: React.ReactNode
  visual?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      <div className="mb-4 grid size-9 place-items-center rounded-lg border bg-background text-brand shadow-xs">
        <Icon className="size-4.5" />
      </div>
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{children}</p>
      {visual && <div className="mt-6 flex-1">{visual}</div>}
    </div>
  )
}

function FunnelVisual() {
  const rows = [
    { l: "Lead", w: "100%", v: "142" },
    { l: "Qualificado", w: "72%", v: "98" },
    { l: "Proposta", w: "48%", v: "61" },
    { l: "Negociação", w: "30%", v: "37" },
    { l: "Ganho", w: "19%", v: "24" },
  ]
  return (
    <div className="space-y-2 rounded-xl border bg-background p-4">
      {rows.map((r, i) => (
        <div key={r.l} className="flex items-center gap-3 text-xs">
          <span className="w-20 shrink-0 text-muted-foreground">{r.l}</span>
          <div className="h-6 flex-1 rounded-md bg-muted">
            <div
              className="flex h-full items-center justify-end rounded-md pr-2 text-[10px] font-medium text-white"
              style={{ width: r.w, background: `color-mix(in oklch, var(--brand) ${100 - i * 14}%, var(--chart-2))` }}
            >
              {r.v}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChartVisual() {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">Receita prevista</span>
        <span className="rounded-full bg-success/15 px-1.5 text-[10px] font-medium text-success">+24%</span>
      </div>
      <div className="mt-1 text-xl font-semibold tabular tracking-tight">R$ 1,28 mi</div>
      <svg viewBox="0 0 200 60" className="mt-3 h-16 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="feat-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity=".35" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 48 C20 44 30 30 50 34 S80 20 100 24 130 10 150 14 180 4 200 6 V60 H0Z" fill="url(#feat-area)" />
        <path
          d="M0 48 C20 44 30 30 50 34 S80 20 100 24 130 10 150 14 180 4 200 6"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

function CommandVisual() {
  return (
    <div className="rounded-xl border bg-background p-2 text-xs shadow-sm">
      <div className="flex items-center gap-2 border-b px-2 pb-2 text-muted-foreground">
        <Command className="size-3.5" /> nimbus
      </div>
      {["Nimbus Tecnologia · Empresa", "Licença anual — Nimbus · Negócio", "Marina Costa · Contato"].map((t, i) => (
        <div key={t} className={cn("mt-1 rounded-md px-2 py-1.5", i === 0 && "bg-muted font-medium")}>
          {t}
        </div>
      ))}
    </div>
  )
}

export function Features() {
  return (
    <section id="recursos" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand">Recursos</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Tudo que o time comercial precisa. Nada que atrapalhe.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Construído para ser rápido de aprender e impossível de largar.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <Tile
            className="md:col-span-4"
            icon={KanbanSquare}
            title="Pipeline visual com arrastar e soltar"
            visual={<FunnelVisual />}
          >
            Veja cada negócio por estágio, com valor, probabilidade e responsável. Mova cards e o forecast se atualiza na
            hora.
          </Tile>
          <Tile className="md:col-span-2" icon={LineChart} title="Previsão de receita" visual={<ChartVisual />}>
            Receita ponderada por probabilidade de cada estágio.
          </Tile>
          <Tile className="md:col-span-2" icon={Command} title="Tudo a um ⌘K" visual={<CommandVisual />}>
            Busque contatos, empresas e negócios de qualquer tela.
          </Tile>
          <Tile className="md:col-span-2" icon={Bell} title="Follow-ups que não escapam">
            Tarefas, ligações e reuniões com prazos. Atrasadas ficam em destaque no dashboard e na sua lista do dia.
          </Tile>
          <Tile className="md:col-span-2" icon={Users} title="Colaboração com papéis">
            Convide o time, defina administradores e mantenha cada workspace isolado e seguro.
          </Tile>
          <Tile className="md:col-span-3" icon={Building2} title="Contas e contatos conectados">
            Empresas, pessoas, notas e histórico completo numa linha do tempo — contexto total antes de cada ligação.
          </Tile>
          <Tile className="md:col-span-3" icon={ShieldCheck} title="Segurança de produção">
            Senhas com hash forte, tokens de uso único, limites de tentativa e dados isolados por organização.
          </Tile>
        </div>
      </div>
    </section>
  )
}
