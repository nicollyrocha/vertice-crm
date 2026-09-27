import "server-only"
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts, deals } from "@/db/schema"
import type { OrgContext } from "@/server/context"
import { PAGE_SIZE } from "./contacts"

export async function listCompanies(ctx: OrgContext, opts: { q?: string; page?: number } = {}) {
  const page = Math.max(1, opts.page ?? 1)
  const where: SQL[] = [eq(companies.orgId, ctx.org.id)]
  if (opts.q) {
    const q = `%${opts.q}%`
    where.push(or(ilike(companies.name, q), ilike(companies.domain, q), ilike(companies.industry, q))!)
  }
  const filter = and(...where)
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: companies.id,
        name: companies.name,
        domain: companies.domain,
        industry: companies.industry,
        size: companies.size,
        createdAt: companies.createdAt,
        contactCount: sql<number>`(select count(*)::int from ${contacts} where ${contacts.companyId} = ${companies.id})`,
        pipelineCents: sql<number>`(select coalesce(sum(${deals.valueCents}), 0)::bigint from ${deals} where ${deals.companyId} = ${companies.id} and ${deals.status} = 'open')`.mapWith(
          Number,
        ),
      })
      .from(companies)
      .where(filter)
      .orderBy(desc(companies.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(companies).where(filter),
  ])
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export type CompanyRow = Awaited<ReturnType<typeof listCompanies>>["rows"][number]

export async function getCompany(ctx: OrgContext, id: string) {
  return (
    (await db.query.companies.findFirst({ where: and(eq(companies.id, id), eq(companies.orgId, ctx.org.id)) })) ?? null
  )
}

export async function companyOptions(ctx: OrgContext) {
  const rows = await db
    .select({ id: companies.id, label: companies.name })
    .from(companies)
    .where(eq(companies.orgId, ctx.org.id))
    .orderBy(asc(companies.name))
    .limit(500)
  return rows
}
