import "server-only"
import { alias } from "drizzle-orm/pg-core"
import { and, asc, desc, eq, gte, isNotNull, isNull, lt, sql, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { activities, companies, contacts, deals, users } from "@/db/schema"
import type { OrgContext } from "@/server/context"

const assignee = alias(users, "assignee")

const fields = {
  id: activities.id,
  type: activities.type,
  title: activities.title,
  description: activities.description,
  dueAt: activities.dueAt,
  completedAt: activities.completedAt,
  dealId: activities.dealId,
  contactId: activities.contactId,
  companyId: activities.companyId,
  assigneeId: activities.assigneeId,
  dealTitle: deals.title,
  contactName: sql<string | null>`nullif(trim(concat(${contacts.firstName}, ' ', ${contacts.lastName})), '')`,
  companyName: companies.name,
  assigneeName: assignee.name,
  assigneeImage: assignee.image,
}

function base() {
  return db
    .select(fields)
    .from(activities)
    .leftJoin(deals, eq(activities.dealId, deals.id))
    .leftJoin(contacts, eq(activities.contactId, contacts.id))
    .leftJoin(companies, eq(activities.companyId, companies.id))
    .leftJoin(assignee, eq(activities.assigneeId, assignee.id))
}

export type ActivityRow = Awaited<ReturnType<typeof listActivitiesFor>>[number]

function dayBounds(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { start, end }
}

/** Atividades agrupadas: atrasadas, hoje, próximas (sem data inclusas), concluídas recentes. */
export async function listActivitiesGrouped(ctx: OrgContext, opts: { mine?: boolean } = {}) {
  const { start, end } = dayBounds()
  const scope: SQL[] = [eq(activities.orgId, ctx.org.id)]
  if (opts.mine) scope.push(eq(activities.assigneeId, ctx.user.id))
  const open = and(...scope, isNull(activities.completedAt))

  const [overdue, today, upcoming, done] = await Promise.all([
    base()
      .where(and(open, lt(activities.dueAt, start)))
      .orderBy(asc(activities.dueAt)),
    base()
      .where(and(open, gte(activities.dueAt, start), lt(activities.dueAt, end)))
      .orderBy(asc(activities.dueAt)),
    base()
      .where(and(open, sql`(${activities.dueAt} >= ${end} or ${activities.dueAt} is null)`))
      .orderBy(sql`${activities.dueAt} asc nulls last`)
      .limit(100),
    base()
      .where(and(...scope, isNotNull(activities.completedAt)))
      .orderBy(desc(activities.completedAt))
      .limit(20),
  ])
  return { overdue, today, upcoming, done }
}

export async function listActivitiesFor(
  ctx: OrgContext,
  by: { dealId?: string; contactId?: string; companyId?: string },
) {
  const where: SQL[] = [eq(activities.orgId, ctx.org.id)]
  if (by.dealId) where.push(eq(activities.dealId, by.dealId))
  if (by.contactId) where.push(eq(activities.contactId, by.contactId))
  if (by.companyId) where.push(eq(activities.companyId, by.companyId))
  return base()
    .where(and(...where))
    .orderBy(sql`${activities.completedAt} is not null`, sql`${activities.dueAt} asc nulls last`)
}

export async function countOverdue(ctx: OrgContext) {
  const { start } = dayBounds()
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(activities)
    .where(and(eq(activities.orgId, ctx.org.id), isNull(activities.completedAt), lt(activities.dueAt, start)))
  return row.n
}
