import "server-only"
import { asc, count, eq } from "drizzle-orm"
import { cache } from "react"
import { db } from "@/db"
import { deals, pipelines, stages } from "@/db/schema"
import type { OrgContext } from "@/server/context"

/** Pipeline principal da organização com estágios ordenados. */
export const getPipeline = cache(async (orgId: string) => {
  const pipeline = await db.query.pipelines.findFirst({
    where: eq(pipelines.orgId, orgId),
    orderBy: asc(pipelines.createdAt),
    with: { stages: { orderBy: asc(stages.position) } },
  })
  if (!pipeline) throw new Error("Organização sem pipeline configurado.")
  return pipeline
})

export async function getPipelineWithCounts(ctx: OrgContext) {
  const pipeline = await getPipeline(ctx.org.id)
  const counts = await db
    .select({ stageId: deals.stageId, n: count() })
    .from(deals)
    .where(eq(deals.pipelineId, pipeline.id))
    .groupBy(deals.stageId)
  const byStage = new Map(counts.map((c) => [c.stageId, c.n]))
  return { ...pipeline, stages: pipeline.stages.map((s) => ({ ...s, dealCount: byStage.get(s.id) ?? 0 })) }
}
