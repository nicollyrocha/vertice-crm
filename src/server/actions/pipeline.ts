"use server"

import { revalidatePath } from "next/cache"
import { and, count, eq } from "drizzle-orm"
import { db } from "@/db"
import { deals, stages } from "@/db/schema"
import { fail, fromZod, ok, type ActionResult, type FormState } from "@/lib/action"
import { stageSchema } from "@/lib/validations/crm"
import { assertCan, requireOrgContext } from "@/server/context"
import { getOrgStage } from "@/server/data/guards"
import { getPipeline } from "@/server/data/pipeline"
import { guarded } from "./safe"

function revalidatePipeline() {
  revalidatePath("/app/settings/pipeline")
  revalidatePath("/app/deals")
  revalidatePath("/app")
}

export async function saveStageAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    assertCan(ctx, "pipeline:manage")
    const parsed = stageSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fromZod(parsed.error)
    const id = formData.get("id")?.toString() || null

    if (id) {
      const stage = await getOrgStage(ctx, id)
      if (!stage) return fail("Estágio não encontrado.")
      await db.update(stages).set(parsed.data).where(eq(stages.id, id))
    } else {
      const pipeline = await getPipeline(ctx.org.id)
      if (pipeline.stages.length >= 12) return fail("Limite de 12 estágios por pipeline.")
      const wonIndex = pipeline.stages.findIndex((s) => s.isWon)
      const position = wonIndex >= 0 ? wonIndex : pipeline.stages.length
      // novo estágio entra antes de "Ganho"
      await db.batch([
        ...pipeline.stages
          .filter((s) => s.position >= position)
          .map((s) => db.update(stages).set({ position: s.position + 1 }).where(eq(stages.id, s.id))),
        db.insert(stages).values({ ...parsed.data, pipelineId: pipeline.id, position }),
      ] as unknown as Parameters<typeof db.batch>[0])
    }
    revalidatePipeline()
    return ok(undefined, id ? "Estágio atualizado." : "Estágio criado.")
  })
}

export async function moveStageAction(stageId: string, direction: "up" | "down"): Promise<ActionResult> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    assertCan(ctx, "pipeline:manage")
    const pipeline = await getPipeline(ctx.org.id)
    const i = pipeline.stages.findIndex((s) => s.id === stageId)
    const j = direction === "up" ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= pipeline.stages.length) return ok()
    const a = pipeline.stages[i]
    const b = pipeline.stages[j]
    await db.batch([
      db.update(stages).set({ position: b.position }).where(eq(stages.id, a.id)),
      db.update(stages).set({ position: a.position }).where(eq(stages.id, b.id)),
    ])
    revalidatePipeline()
    return ok()
  })
}

export async function deleteStageAction(stageId: string): Promise<ActionResult> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    assertCan(ctx, "pipeline:manage")
    const stage = await getOrgStage(ctx, stageId)
    if (!stage) return fail("Estágio não encontrado.")
    if (stage.isWon) return fail("O estágio de ganho não pode ser removido.")
    const [{ n }] = await db
      .select({ n: count() })
      .from(deals)
      .where(and(eq(deals.stageId, stageId), eq(deals.orgId, ctx.org.id)))
    if (n > 0) return fail(`Mova os ${n} negócio(s) deste estágio antes de removê-lo.`)
    const pipeline = await getPipeline(ctx.org.id)
    if (pipeline.stages.length <= 2) return fail("O pipeline precisa de pelo menos 2 estágios.")
    await db.delete(stages).where(eq(stages.id, stageId))
    revalidatePipeline()
    return ok(undefined, "Estágio removido.")
  })
}
