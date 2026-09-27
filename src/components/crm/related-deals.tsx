import Link from "next/link"
import { formatBRL } from "@/lib/format"
import type { DealRow } from "@/server/data/deals"
import { DealStatusBadge, StageBadge } from "./badges"

export function RelatedDeals({ deals }: { deals: DealRow[] }) {
  if (deals.length === 0) return <p className="text-sm text-muted-foreground">Nenhum negócio vinculado.</p>
  return (
    <ul className="-mx-4 -my-4 divide-y">
      {deals.map((d) => (
        <li key={d.id}>
          <Link href={`/app/deals/${d.id}`} className="block px-4 py-3 transition-colors hover:bg-muted/40">
            <div className="truncate text-sm font-medium">{d.title}</div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              {d.status === "open" ? <StageBadge name={d.stageName} color={d.stageColor} /> : <DealStatusBadge status={d.status} />}
              <span className="text-sm font-medium tabular">{formatBRL(d.valueCents)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
