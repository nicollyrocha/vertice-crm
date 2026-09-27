import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, CalendarCheck, Target, TrendingUp } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { ActivityItem } from "@/components/crm/activity-item"
import { DealStatusBadge, StageBadge } from "@/components/crm/badges"
import { RevenueChart, StageBarChart } from "@/components/crm/dashboard-charts"
import { Button } from "@/components/ui/button"
import { formatBRL, formatCompactBRL, formatPercent, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"
import { requireOrgContext } from "@/server/context"
import { listActivitiesGrouped } from "@/server/data/activities"
import { getDashboard, recentDeals } from "@/server/data/dashboard"

export const metadata: Metadata = { title: "Início" }

function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date()))
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border bg-card", className)}>{children}</section>
}

function CardHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4">
      <h2 className="text-sm font-medium">{title}</h2>
      {action}
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: React.ReactNode
  tone?: "danger"
}) {
  return (
    <div className="flex items-start gap-3 p-5">
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground",
          tone === "danger" && "bg-destructive/10 text-destructive",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-xl font-semibold tabular tracking-tight">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const ctx = await requireOrgContext()
  const [dash, recent, acts] = await Promise.all([
    getDashboard(ctx),
    recentDeals(ctx),
    listActivitiesGrouped(ctx, { mine: true }),
  ])
  const { kpis } = dash
  const agenda = [...acts.overdue, ...acts.today].slice(0, 6)
  const first = ctx.user.name?.split(" ")[0]

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader
        title={`${greeting()}${first ? `, ${first}` : ""}`}
        description="Aqui está o pulso das suas vendas hoje."
        actions={
          <Button asChild>
            <Link href="/app/deals?new=1">Novo negócio</Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Elemento herói: pipeline aberto + receita */}
        <Card className="relative overflow-hidden xl:col-span-2">
          <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand/10 blur-3xl" />
          <div className="relative grid gap-6 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
            <div className="flex flex-col justify-between gap-6 sm:w-56">
              <div>
                <div className="text-sm text-muted-foreground">Pipeline em aberto</div>
                <div className="mt-1 text-4xl font-semibold tabular tracking-tight">{formatCompactBRL(kpis.openCents)}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {kpis.openCount} negócio{kpis.openCount === 1 ? "" : "s"} ativo{kpis.openCount === 1 ? "" : "s"}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-1">
                <div>
                  <dt className="text-xs text-muted-foreground">Previsão ponderada</dt>
                  <dd className="text-base font-semibold tabular">{formatBRL(kpis.weightedCents)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Ganho no mês</dt>
                  <dd className="flex items-center gap-1.5 text-base font-semibold tabular">
                    {formatCompactBRL(kpis.wonThisMonthCents)}
                    {kpis.wonDelta !== null && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-1.5 text-[11px] font-medium",
                          kpis.wonDelta >= 0 ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
                        )}
                      >
                        {kpis.wonDelta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                        {formatPercent(Math.abs(kpis.wonDelta))}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="min-w-0">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Receita ganha · últimos 6 meses</div>
              <RevenueChart data={dash.revenueSeries} />
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <MiniStat
            icon={Target}
            label="Taxa de conversão"
            value={kpis.winRate === null ? "—" : formatPercent(kpis.winRate)}
            hint="ganhos ÷ negócios fechados"
          />
          <MiniStat
            icon={TrendingUp}
            label="Ticket médio aberto"
            value={kpis.openCount ? formatCompactBRL(kpis.openCents / kpis.openCount) : "—"}
          />
          <MiniStat
            icon={AlertTriangle}
            label="Atividades atrasadas"
            value={String(kpis.overdue)}
            tone={kpis.overdue > 0 ? "danger" : undefined}
            hint={
              kpis.overdue > 0 ? (
                <Link href="/app/activities" className="underline-offset-4 hover:underline">
                  Resolver agora →
                </Link>
              ) : (
                "Tudo em dia 🎯"
              )
            }
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHead
            title="Valor em aberto por estágio"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/app/deals">
                  Ver pipeline <ArrowRight />
                </Link>
              </Button>
            }
          />
          <div className="p-5 pt-3">
            <StageBarChart data={dash.byStage.filter((s) => s.probability < 100)} />
          </div>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <CardHead
            title="Sua agenda de hoje"
            action={
              <Button asChild variant="ghost" size="sm">
                <Link href="/app/activities">
                  Todas <ArrowRight />
                </Link>
              </Button>
            }
          />
          {agenda.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center text-sm text-muted-foreground">
              <CalendarCheck className="size-6 text-success" />
              Nada pendente para hoje.
            </div>
          ) : (
            <div className="mt-2 divide-y">
              {agenda.map((a) => (
                <ActivityItem key={a.id} activity={a} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHead title="Negócios movimentados recentemente" />
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nenhum negócio ainda. Crie o primeiro no pipeline.</p>
        ) : (
          <ul className="mt-2 divide-y">
            {recent.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/app/deals/${d.id}`}
                  className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-muted/40"
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{d.title}</span>
                  <span className="hidden sm:inline">
                    {d.status === "open" ? <StageBadge name={d.stageName} color={d.stageColor} /> : <DealStatusBadge status={d.status} />}
                  </span>
                  <span className="w-28 text-right font-medium tabular">{formatBRL(d.valueCents)}</span>
                  <span className="hidden w-24 text-right text-xs text-muted-foreground md:inline">
                    {formatRelative(d.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
