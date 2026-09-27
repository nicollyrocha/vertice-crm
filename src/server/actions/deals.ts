"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq, gte, sql } from "drizzle-orm"
import { db } from "@/db"
import { deals } from "@/db/schema"
import { fail, fromZod, ok, type ActionResult, type FormState } from "@/lib/action"
import { formatBRL } from "@/lib/format"
import { dealSchema } from "@/lib/validations/crm"
import { requireOrgContext } from "@/server/context"
import { assertRefs, getOrgStage } from "@/server/data/guards"
import { logActivity } from "@/server/data/timeline"
import { guarded } from "./safe"

function revalidateDeals(id?: string) {
  revalidatePath("/app")
  revalidatePath("/app/deals")
  if (id) revalidatePath(`/app/deals/${id}`)
}

export async function saveDealAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    const parsed = dealSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fromZod(parsed.error)
    const data = parsed.data
    const id = formData.get("id")?.toString() || null

    const stage = await getOrgStage(ctx, data.stageId)
    if (!stage) return fail("Estágio inválido.")
    await assertRefs(ctx, { contactId: data.contactId, companyId: data.companyId, userId: data.ownerId })

    const values = {
      title: data.title,
      valueCents: data.valueCents,
      stageId: stage.id,
      pipelineId: stage.pipelineId,
      contactId: data.contactId,
      companyId: data.companyId,
      ownerId: data.ownerId ?? ctx.user.id,
      expectedCloseDate: data.expectedCloseDate,
    }

    if (id) {
      const [before] = await db
        .select({ stageId: deals.stageId })
        .from(deals)
        .where(and(eq(deals.id, id), eq(deals.orgId, ctx.org.id)))
      if (!before) return fail("Negócio não encontrado.")
      await db
        .update(deals)
        .set({
          ...values,
          ...(stage.isWon ? { status: "won" as const, closedAt: new Date() } : {}),
        })
        .where(and(eq(deals.id, id), eq(deals.orgId, ctx.org.id)))
      await logActivity(
        ctx,
        "deal",
        id,
        before.stageId !== stage.id ? "stage_changed" : "updated",
        before.stageId !== stage.id ? { to: stage.name } : undefined,
      )
      revalidateDeals(id)
      return ok({ id }, "Negócio atualizado.")
    }

    const [created] = await db
      .insert(deals)
      .values({
        ...values,
        orgId: ctx.org.id,
        status: stage.isWon ? "won" : "open",
        closedAt: stage.isWon ? new Date() : null,
      })
      .returning({ id: deals.id })
    await logActivity(ctx, "deal", created.id, "created", { value: formatBRL(data.valueCents) })
    revalidateDeals()
    return ok({ id: created.id }, "Negócio criado.")
  })
}

/** Move um negócio no kanban (outro estágio e/ou posição). */
export async function moveDealAction(dealId: string, stageId: string, position: number): Promise<ActionResult> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    const stage = await getOrgStage(ctx, stageId)
    if (!stage) return fail("Estágio inválido.")
    const [deal] = await db
      .select({ stageId: deals.stageId, status: deals.status })
      .from(deals)
      .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.org.id)))
    if (!deal) return fail("Negócio não encontrado.")

    const pos = Math.max(0, Math.floor(position))
    await db.batch([
      // abre espaço na coluna de destino
      db
        .update(deals)
        .set({ position: sql`${deals.position} + 1` })
        .where(and(eq(deals.orgId, ctx.org.id), eq(deals.stageId, stageId), gte(deals.position, pos))),
      db
        .update(deals)
        .set({
          stageId,
          position: pos,
          ...(stage.isWon
            ? { status: "won" as const, closedAt: new Date() }
            : deal.status === "won"
              ? { status: "open" as const, closedAt: null }
              : {}),
        })
        .where(eq(deals.id, dealId)),
    ])
    if (deal.stageId !== stageId) await logActivity(ctx, "deal", dealId, "stage_changed", { to: stage.name })
    revalidateDeals(dealId)
    return ok()
  })
}

export async function setDealStatusAction(dealId: string, status: "open" | "won" | "lost"): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  const [row] = await db
    .update(deals)
    .set({ status, closedAt: status === "open" ? null : new Date() })
    .where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.org.id)))
    .returning({ id: deals.id })
  if (!row) return fail("Negócio não encontrado.")
  await logActivity(ctx, "deal", dealId, `status_${status}`)
  revalidateDeals(dealId)
  const labels = { open: "Negócio reaberto.", won: "Negócio marcado como ganho! 🎉", lost: "Negócio marcado como perdido." }
  return ok(undefined, labels[status])
}

export async function deleteDealAction(dealId: string, redirectTo?: string): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  await db.delete(deals).where(and(eq(deals.id, dealId), eq(deals.orgId, ctx.org.id)))
  revalidateDeals()
  if (redirectTo) redirect(redirectTo)
  return ok(undefined, "Negócio excluído.")
}
