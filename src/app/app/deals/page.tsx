import type { Metadata } from "next"
import { DealsView } from "@/components/crm/deals-view"
import { requireOrgContext } from "@/server/context"
import { listDeals } from "@/server/data/deals"
import { dealFormOptions } from "@/server/data/options"

export const metadata: Metadata = { title: "Negócios" }

export default async function DealsPage({ searchParams }: { searchParams: Promise<{ q?: string; view?: string }> }) {
  const sp = await searchParams
  const ctx = await requireOrgContext()
  const [{ pipeline, options }, deals] = await Promise.all([
    dealFormOptions(ctx),
    listDeals(ctx, { q: sp.q?.slice(0, 100) }),
  ])
  return (
    <DealsView
      stages={pipeline.stages}
      deals={deals.filter((d) => sp.view === "list" || d.status !== "lost")}
      options={options}
      view={sp.view === "list" ? "list" : "board"}
    />
  )
}
