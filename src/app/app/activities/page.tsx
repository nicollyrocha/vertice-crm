import type { Metadata } from "next"
import { ActivitiesView } from "@/components/crm/activities-view"
import { requireOrgContext } from "@/server/context"
import { listActivitiesGrouped } from "@/server/data/activities"
import { listDeals } from "@/server/data/deals"
import { memberOptions } from "@/server/data/members"

export const metadata: Metadata = { title: "Atividades" }

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ scope?: string }> }) {
  const sp = await searchParams
  const ctx = await requireOrgContext()
  const mine = sp.scope !== "all"
  const [groups, members, deals] = await Promise.all([
    listActivitiesGrouped(ctx, { mine }),
    memberOptions(ctx),
    listDeals(ctx, { status: "open" }),
  ])
  return (
    <ActivitiesView
      groups={groups}
      mine={mine}
      members={members.map((m) => ({ id: m.id, label: m.label }))}
      deals={deals.map((d) => ({ id: d.id, label: d.title }))}
    />
  )
}
