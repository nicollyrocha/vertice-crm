import "server-only"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts, deals, memberships, pipelines, stages } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export class NotFoundInOrg extends Error {
  constructor(what: string) {
    super(`${what} não encontrado(a).`)
  }
}

/** Garante que IDs referenciados vindos do cliente pertencem à organização ativa. */
export async function assertRefs(
  ctx: OrgContext,
  refs: { companyId?: string | null; contactId?: string | null; dealId?: string | null; userId?: string | null },
) {
  const checks: Promise<void>[] = []
  if (refs.companyId)
    checks.push(
      db.query.companies
        .findFirst({ where: and(eq(companies.id, refs.companyId), eq(companies.orgId, ctx.org.id)), columns: { id: true } })
        .then((r) => {
          if (!r) throw new NotFoundInOrg("Empresa")
        }),
    )
  if (refs.contactId)
    checks.push(
      db.query.contacts
        .findFirst({ where: and(eq(contacts.id, refs.contactId), eq(contacts.orgId, ctx.org.id)), columns: { id: true } })
        .then((r) => {
          if (!r) throw new NotFoundInOrg("Contato")
        }),
    )
  if (refs.dealId)
    checks.push(
      db.query.deals
        .findFirst({ where: and(eq(deals.id, refs.dealId), eq(deals.orgId, ctx.org.id)), columns: { id: true } })
        .then((r) => {
          if (!r) throw new NotFoundInOrg("Negócio")
        }),
    )
  if (refs.userId)
    checks.push(
      db.query.memberships
        .findFirst({
          where: and(eq(memberships.userId, refs.userId), eq(memberships.orgId, ctx.org.id)),
          columns: { userId: true },
        })
        .then((r) => {
          if (!r) throw new NotFoundInOrg("Responsável")
        }),
    )
  await Promise.all(checks)
}

/** Retorna o estágio se ele pertence a um pipeline da organização. */
export async function getOrgStage(ctx: OrgContext, stageId: string) {
  const [row] = await db
    .select({ stage: stages })
    .from(stages)
    .innerJoin(pipelines, eq(stages.pipelineId, pipelines.id))
    .where(and(eq(stages.id, stageId), eq(pipelines.orgId, ctx.org.id)))
    .limit(1)
  return row?.stage ?? null
}
