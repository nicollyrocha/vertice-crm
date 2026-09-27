import "server-only"
import { and, asc, desc, eq, gte, sql } from "drizzle-orm"
import { db } from "@/db"
import { deals, stages } from "@/db/schema"
import { APP_TZ, startOfMonthInTz } from "@/lib/dates"
import type { OrgContext } from "@/server/context"
import { countOverdue } from "./activities"
import { getPipeline } from "./pipeline"

const startOfMonth = (offset = 0) => startOfMonthInTz(offset)
const monthKey = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ, year: "numeric", month: "2-digit" }).format(d)

export async function getDashboard(ctx: OrgContext) {
  const pipeline = await getPipeline(ctx.org.id)
  const orgId = ctx.org.id
  const thisMonth = startOfMonth()
  const lastMonth = startOfMonth(-1)
  const sixMonthsAgo = startOfMonth(-5)

  const [byStage, totals, monthly, overdue] = await Promise.all([
    db
      .select({
        stageId: stages.id,
        name: stages.name,
        color: stages.color,
        probability: stages.probability,
        count: sql<number>`count(${deals.id})::int`,
        valueCents: sql<number>`coalesce(sum(${deals.valueCents}), 0)::bigint`.mapWith(Number),
      })
      .from(stages)
      .leftJoin(deals, and(eq(deals.stageId, stages.id), eq(deals.status, "open")))
      .where(eq(stages.pipelineId, pipeline.id))
      .groupBy(stages.id)
      .orderBy(asc(stages.position)),
    db
      .select({
        openCents: sql<number>`coalesce(sum(${deals.valueCents}) filter (where ${deals.status} = 'open'), 0)::bigint`.mapWith(Number),
        openCount: sql<number>`count(*) filter (where ${deals.status} = 'open')::int`,
        wonThisMonthCents: sql<number>`coalesce(sum(${deals.valueCents}) filter (where ${deals.status} = 'won' and ${deals.closedAt} >= ${thisMonth}), 0)::bigint`.mapWith(Number),
        wonLastMonthCents: sql<number>`coalesce(sum(${deals.valueCents}) filter (where ${deals.status} = 'won' and ${deals.closedAt} >= ${lastMonth} and ${deals.closedAt} < ${thisMonth}), 0)::bigint`.mapWith(Number),
        wonCount: sql<number>`count(*) filter (where ${deals.status} = 'won')::int`,
        lostCount: sql<number>`count(*) filter (where ${deals.status} = 'lost')::int`,
        weightedCents: sql<number>`coalesce(sum(${deals.valueCents} * ${stages.probability} / 100) filter (where ${deals.status} = 'open'), 0)::bigint`.mapWith(Number),
      })
      .from(deals)
      .innerJoin(stages, eq(deals.stageId, stages.id))
      .where(eq(deals.orgId, orgId)),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', (${deals.closedAt} at time zone 'UTC') at time zone ${APP_TZ}), 'YYYY-MM')`,
        wonCents: sql<number>`coalesce(sum(${deals.valueCents}), 0)::bigint`.mapWith(Number),
      })
      .from(deals)
      .where(and(eq(deals.orgId, orgId), eq(deals.status, "won"), gte(deals.closedAt, sixMonthsAgo)))
      .groupBy(sql`1`)
      .orderBy(sql`1`),
    countOverdue(ctx),
  ])

  const t = totals[0]
  const closed = t.wonCount + t.lostCount
  const monthlyMap = new Map(monthly.map((m) => [m.month, m.wonCents]))
  const revenueSeries = Array.from({ length: 6 }, (_, i) => {
    const d = startOfMonth(i - 5)
    const key = monthKey(d)
    const label = d.toLocaleDateString("pt-BR", { month: "short", timeZone: APP_TZ }).replace(".", "")
    return { key, label, wonCents: monthlyMap.get(key) ?? 0 }
  })

  return {
    kpis: {
      openCents: t.openCents,
      openCount: t.openCount,
      weightedCents: t.weightedCents,
      wonThisMonthCents: t.wonThisMonthCents,
      wonDelta: t.wonLastMonthCents > 0 ? ((t.wonThisMonthCents - t.wonLastMonthCents) / t.wonLastMonthCents) * 100 : null,
      winRate: closed > 0 ? (t.wonCount / closed) * 100 : null,
      overdue,
    },
    byStage,
    revenueSeries,
  }
}

export async function recentDeals(ctx: OrgContext, limit = 6) {
  return db
    .select({
      id: deals.id,
      title: deals.title,
      valueCents: deals.valueCents,
      status: deals.status,
      stageName: stages.name,
      stageColor: stages.color,
      updatedAt: deals.updatedAt,
    })
    .from(deals)
    .innerJoin(stages, eq(deals.stageId, stages.id))
    .where(eq(deals.orgId, ctx.org.id))
    .orderBy(desc(deals.updatedAt))
    .limit(limit)
}
