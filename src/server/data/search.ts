import "server-only"
import { and, eq, ilike, or } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts, deals } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export type SearchHit = { type: "deal" | "contact" | "company"; id: string; label: string; sub?: string | null }

export async function globalSearch(ctx: OrgContext, term: string): Promise<SearchHit[]> {
  const q = `%${term.trim()}%`
  if (term.trim().length < 2) return []
  const [d, c, co] = await Promise.all([
    db
      .select({ id: deals.id, label: deals.title })
      .from(deals)
      .where(and(eq(deals.orgId, ctx.org.id), ilike(deals.title, q)))
      .limit(5),
    db
      .select({ id: contacts.id, first: contacts.firstName, last: contacts.lastName, email: contacts.email })
      .from(contacts)
      .where(
        and(
          eq(contacts.orgId, ctx.org.id),
          or(ilike(contacts.firstName, q), ilike(contacts.lastName, q), ilike(contacts.email, q)),
        ),
      )
      .limit(5),
    db
      .select({ id: companies.id, label: companies.name, domain: companies.domain })
      .from(companies)
      .where(and(eq(companies.orgId, ctx.org.id), or(ilike(companies.name, q), ilike(companies.domain, q))))
      .limit(5),
  ])
  return [
    ...d.map((x) => ({ type: "deal" as const, id: x.id, label: x.label })),
    ...c.map((x) => ({
      type: "contact" as const,
      id: x.id,
      label: [x.first, x.last].filter(Boolean).join(" "),
      sub: x.email,
    })),
    ...co.map((x) => ({ type: "company" as const, id: x.id, label: x.label, sub: x.domain })),
  ]
}
