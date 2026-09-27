import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { memberships, organizations, pipelines, stages } from "@/db/schema"

export const defaultStages = [
  { name: "Lead", probability: 10, color: "slate" },
  { name: "Qualificado", probability: 25, color: "sky" },
  { name: "Proposta", probability: 50, color: "violet" },
  { name: "Negociação", probability: 75, color: "amber" },
  { name: "Ganho", probability: 100, color: "emerald", isWon: true },
] as const

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "org"
  )
}

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
        isWon: "isWon" in s ? s.isWon : false,
        position,
      })),
    ),
  ])
  return { orgId, pipelineId }
}
