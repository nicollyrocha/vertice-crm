import {
  BarChart3,
  Building2,
  CheckSquare,
  Home,
  KanbanSquare,
  Search,
  Settings,
  Users,
} from "lucide-react"
import { LogoMark } from "@/components/logo"
import { cn } from "@/lib/utils"

const columns = [
  {
    name: "Qualificado",
    dot: "bg-sky-500",
    total: "R$ 84 mil",
    cards: [
      { t: "Licença anual — Nimbus", v: "R$ 36.000", who: "MC", tag: "Quente" },
      { t: "Expansão time LATAM", v: "R$ 48.000", who: "RS" },
    ],
  },
  {
    name: "Proposta",
    dot: "bg-violet-500",
    total: "R$ 212 mil",
    cards: [
      { t: "Onboarding Enterprise — Orbe", v: "R$ 120.000", who: "AL", tag: "Hoje" },
      { t: "Plano Pro — Kappa Log", v: "R$ 52.000", who: "MC" },
      { t: "Renovação Atlas", v: "R$ 40.000", who: "JP" },
    ],
  },
  {
    name: "Negociação",
    dot: "bg-amber-500",
    total: "R$ 156 mil",
    cards: [
      { t: "Migração CRM — Solaris", v: "R$ 96.000", who: "RS", tag: "Contrato" },
      { t: "Pacote consultoria", v: "R$ 60.000", who: "AL" },
    ],
  },
]

const nav = [
  { icon: Home, label: "Início" },
  { icon: KanbanSquare, label: "Negócios", active: true },
  { icon: Users, label: "Contatos" },
  { icon: Building2, label: "Empresas" },
  { icon: CheckSquare, label: "Atividades" },
  { icon: BarChart3, label: "Relatórios" },
]

/** Screenshot "vivo" do produto, feito em JSX (nítido em qualquer tela e em dark mode). */
export function ProductMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-background shadow-[0_30px_80px_-20px_rgb(0_0_0/0.25)] ring-1 ring-black/5 dark:shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] dark:ring-white/5",
        className,
      )}
      aria-hidden
    >
      <div className="flex h-9 items-center gap-1.5 border-b bg-muted/40 px-3">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <div className="mx-auto hidden h-5 w-64 items-center justify-center rounded-md bg-background/80 text-[10px] text-muted-foreground sm:flex">
          app.vertice.com.br/negocios
        </div>
      </div>
      <div className="flex text-left">
        <aside className="hidden w-48 shrink-0 border-r bg-sidebar p-3 md:block">
          <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold">
            <LogoMark className="size-5" /> Acme Ltda
          </div>
          <div className="mb-3 flex h-7 items-center gap-2 rounded-md border bg-background px-2 text-[11px] text-muted-foreground">
            <Search className="size-3" /> Buscar
            <kbd className="ml-auto rounded border px-1 text-[9px]">⌘K</kbd>
          </div>
          <nav className="space-y-0.5">
            {nav.map((n) => (
              <div
                key={n.label}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2 text-[12px] text-muted-foreground",
                  n.active && "bg-sidebar-accent font-medium text-foreground shadow-[inset_0_0_0_1px_var(--border)]",
                )}
              >
                <n.icon className="size-3.5" /> {n.label}
              </div>
            ))}
          </nav>
          <div className="mt-6 flex items-center gap-2 rounded-md p-1 text-[11px] text-muted-foreground">
            <Settings className="size-3.5" /> Configurações
          </div>
        </aside>
        <div className="min-w-0 flex-1 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Pipeline de vendas</div>
              <div className="text-[11px] text-muted-foreground">24 negócios abertos · R$ 452 mil</div>
            </div>
            <div className="flex gap-1.5">
              <div className="hidden h-7 items-center rounded-md border px-2.5 text-[11px] sm:flex">Filtros</div>
              <div className="flex h-7 items-center rounded-md bg-primary px-2.5 text-[11px] font-medium text-primary-foreground">
                + Novo negócio
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {columns.map((col, ci) => (
              <div key={col.name} className={cn("rounded-xl bg-muted/50 p-2", ci === 2 && "hidden lg:block")}>
                <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium">
                  <span className={cn("size-1.5 rounded-full", col.dot)} />
                  {col.name}
                  <span className="ml-auto text-muted-foreground tabular">{col.total}</span>
                </div>
                <div className="space-y-2">
                  {col.cards.map((c, i) => (
                    <div
                      key={c.t}
                      className={cn(
                        "rounded-lg border bg-card p-2.5 shadow-xs",
                        ci === 1 && i === 0 && "rotate-[-1.5deg] shadow-lg ring-2 ring-brand/40",
                      )}
                    >
                      <div className="text-[11.5px] font-medium leading-snug">{c.t}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground tabular">{c.v}</span>
                        <div className="flex items-center gap-1">
                          {c.tag && (
                            <span className="rounded-full bg-brand-soft px-1.5 py-px text-[9px] font-medium text-brand">
                              {c.tag}
                            </span>
                          )}
                          <span className="grid size-4 place-items-center rounded-full bg-foreground/10 text-[7px] font-semibold">
                            {c.who}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
