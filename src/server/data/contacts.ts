import "server-only"
import { and, asc, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts, deals } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export const PAGE_SIZE = 20

export async function listContacts(ctx: OrgContext, opts: { q?: string; page?: number; companyId?: string } = {}) {
  const page = Math.max(1, opts.page ?? 1)
  const where: SQL[] = [eq(contacts.orgId, ctx.org.id)]
  if (opts.companyId) where.push(eq(contacts.companyId, opts.companyId))
  if (opts.q) {
    const q = `%${opts.q}%`
    where.push(
      or(ilike(contacts.firstName, q), ilike(contacts.lastName, q), ilike(contacts.email, q), ilike(companies.name, q))!,
    )
  }
  const filter = and(...where)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone,
        title: contacts.title,
        companyId: contacts.companyId,
        companyName: companies.name,
        createdAt: contacts.createdAt,
        openDeals: sql<number>`(select count(*)::int from ${deals} where ${deals.contactId} = ${contacts.id} and ${deals.status} = 'open')`,
      })
      .from(contacts)
      .leftJoin(companies, eq(contacts.companyId, companies.id))
      .where(filter)
      .orderBy(desc(contacts.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(contacts).leftJoin(companies, eq(contacts.companyId, companies.id)).where(filter),
  ])
  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export type ContactRow = Awaited<ReturnType<typeof listContacts>>["rows"][number]

export async function getContact(ctx: OrgContext, id: string) {
  const [row] = await db
    .select({ contact: contacts, companyName: companies.name })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .where(and(eq(contacts.id, id), eq(contacts.orgId, ctx.org.id)))
    .limit(1)
  return row ? { ...row.contact, companyName: row.companyName } : null
}

export async function contactOptions(ctx: OrgContext) {
  const rows = await db
    .select({ id: contacts.id, firstName: contacts.firstName, lastName: contacts.lastName })
    .from(contacts)
    .where(eq(contacts.orgId, ctx.org.id))
    .orderBy(asc(contacts.firstName))
    .limit(500)
  return rows.map((r) => ({ id: r.id, label: [r.firstName, r.lastName].filter(Boolean).join(" ") }))
}
