import "server-only"
import { alias } from "drizzle-orm/pg-core"
import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts, deals, stages, users } from "@/db/schema"
import type { OrgContext } from "@/server/context"

const owner = alias(users, "owner")

const dealFields = {
  id: deals.id,
  title: deals.title,
  valueCents: deals.valueCents,
  status: deals.status,
  stageId: deals.stageId,
  position: deals.position,
  expectedCloseDate: deals.expectedCloseDate,
  createdAt: deals.createdAt,
  updatedAt: deals.updatedAt,
  closedAt: deals.closedAt,
  contactId: deals.contactId,
  companyId: deals.companyId,
  ownerId: deals.ownerId,
  contactName: sql<string | null>`nullif(trim(concat(${contacts.firstName}, ' ', ${contacts.lastName})), '')`,
  companyName: companies.name,
  ownerName: owner.name,
  ownerImage: owner.image,
  stageName: stages.name,
  stageColor: stages.color,
}

function baseQuery() {
  return db
    .select(dealFields)
    .from(deals)
    .innerJoin(stages, eq(deals.stageId, stages.id))
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .leftJoin(owner, eq(deals.ownerId, owner.id))
}

export type DealRow = Awaited<ReturnType<typeof listDeals>>[number]

export async function listDeals(
  ctx: OrgContext,
  opts: { q?: string; status?: "open" | "won" | "lost"; pipelineId?: string } = {},
) {
  const where: SQL[] = [eq(deals.orgId, ctx.org.id)]
  if (opts.pipelineId) where.push(eq(deals.pipelineId, opts.pipelineId))
  if (opts.status) where.push(eq(deals.status, opts.status))
  if (opts.q) {
    const q = `%${opts.q}%`
    where.push(or(ilike(deals.title, q), ilike(companies.name, q), ilike(contacts.firstName, q))!)
  }
  return baseQuery()
    .where(and(...where))
    .orderBy(asc(stages.position), asc(deals.position), desc(deals.createdAt))
}

export async function getDeal(ctx: OrgContext, id: string) {
  const [row] = await baseQuery()
    .where(and(eq(deals.id, id), eq(deals.orgId, ctx.org.id)))
    .limit(1)
  return row ?? null
}

export async function listDealsFor(ctx: OrgContext, by: { contactId?: string; companyId?: string }) {
  const where: SQL[] = [eq(deals.orgId, ctx.org.id)]
  if (by.contactId) where.push(eq(deals.contactId, by.contactId))
  if (by.companyId) where.push(eq(deals.companyId, by.companyId))
  return baseQuery()
    .where(and(...where))
    .orderBy(desc(deals.createdAt))
}
