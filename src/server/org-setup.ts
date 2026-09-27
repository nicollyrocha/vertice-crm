import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { memberships, organizations, pipelines, stages } from "@/db/schema"
import { defaultStages, slugify } from "@/lib/org"

async function uniqueSlug(name: string) {
  const base = slugify(name)
  for (let i = 0; i < 5; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`
    const exists = await db.query.organizations.findFirst({ where: eq(organizations.slug, slug), columns: { id: true } })
    if (!exists) return slug
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

/** Cria organização + owner + pipeline padrão atomicamente (db.batch = transação no Neon HTTP). */
export async function createOrganization(name: string, ownerId: string) {
  const orgId = crypto.randomUUID()
  const pipelineId = crypto.randomUUID()
  const slug = await uniqueSlug(name)
  await db.batch([
    db.insert(organizations).values({ id: orgId, name, slug }),
    db.insert(memberships).values({ orgId, userId: ownerId, role: "owner" }),
    db.insert(pipelines).values({ id: pipelineId, orgId, name: "Vendas" }),
    db.insert(stages).values(
      defaultStages.map((s, position) => ({
        pipelineId,
        name: s.name,
        probability: s.probability,
        color: s.color,
        isWon: s.isWon,
        position,
      })),
    ),
  ])
  return { orgId, pipelineId }
}
