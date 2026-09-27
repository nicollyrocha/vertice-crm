import "server-only"
import type { OrgContext } from "@/server/context"
import { companyOptions } from "./companies"
import { contactOptions } from "./contacts"
import { memberOptions } from "./members"
import { getPipeline } from "./pipeline"

/** Opções para os selects do formulário de negócio. */
export async function dealFormOptions(ctx: OrgContext) {
  const [pipeline, companies, contacts, members] = await Promise.all([
    getPipeline(ctx.org.id),
    companyOptions(ctx),
    contactOptions(ctx),
    memberOptions(ctx),
  ])
  return {
    pipeline,
    options: {
      stages: pipeline.stages.map((s) => ({ id: s.id, label: s.name })),
      companies,
      contacts,
      members: members.map((m) => ({ id: m.id, label: m.label })),
    },
  }
}
