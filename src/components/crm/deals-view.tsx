"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { KanbanSquare, List, Plus } from "lucide-react"
import { UserAvatar } from "@/components/app/user-avatar"
import { EmptyState, PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import type { Stage } from "@/db/schema"
import { formatBRL, formatCompactBRL, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { DealRow } from "@/server/data/deals"
import { DealStatusBadge, StageBadge } from "./badges"
import { DealsBoard } from "./deals-board"
import { DealDialog, type DealFormOptions } from "./entity-forms"
import { SearchInput } from "./search-input"

export function DealsView({
  stages,
  deals,
  options,
  view,
}: {
  stages: Stage[]
  deals: DealRow[]
  options: DealFormOptions
  view: "board" | "list"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [createOpen, setCreateOpen] = useState(params.get("new") === "1")
  const [stageForNew, setStageForNew] = useState<string | undefined>()

  const open = deals.filter((d) => d.status === "open")
  const total = open.reduce((s, d) => s + d.valueCents, 0)

  function setView(v: "board" | "list") {
    const sp = new URLSearchParams(params)
    if (v === "board") sp.delete("view")
    else sp.set("view", v)
    router.replace(`${pathname}?${sp}`)
  }

  function openCreate(stageId?: string) {
    setStageForNew(stageId)
    setCreateOpen(true)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Negócios"
        description={`${open.length} em aberto · ${formatCompactBRL(total)} no pipeline`}
        actions={
          <Button onClick={() => openCreate()}>
            <Plus /> Novo negócio
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Buscar por título, empresa ou contato…" className="sm:max-w-xs" />
        <div className="inline-flex self-start rounded-lg border bg-muted/50 p-0.5 sm:ml-auto">
          {(
            [
              ["board", KanbanSquare, "Kanban"],
              ["list", List, "Lista"],
            ] as const
          ).map(([v, Icon, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors",
                view === v && "bg-background text-foreground shadow-sm",
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {deals.length === 0 && !params.get("q") ? (
        <EmptyState
          icon={KanbanSquare}
          title="Seu pipeline está vazio"
          description="Crie o primeiro negócio para começar a acompanhar suas oportunidades."
          action={
            <Button onClick={() => openCreate()}>
              <Plus /> Criar negócio
            </Button>
          }
        />
      ) : view === "board" ? (
        <DealsBoard stages={stages} deals={deals.filter((d) => d.status !== "lost")} onCreate={openCreate} />
      ) : (
        <DealsTable deals={deals} />
      )}

      <DealDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o)
          if (!o && params.get("new")) router.replace(pathname)
        }}
        options={options}
        deal={stageForNew ? { stageId: stageForNew } : undefined}
      />
    </div>
  )
}

function DealsTable({ deals }: { deals: DealRow[] }) {
  if (deals.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Nenhum resultado.</p>
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      {/* Desktop */}
      <table className="hidden w-full text-[13px] md:table">
        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Negócio</th>
            <th className="px-4 py-2.5 font-medium">Estágio</th>
            <th className="px-4 py-2.5 text-right font-medium">Valor</th>
            <th className="px-4 py-2.5 font-medium">Empresa</th>
            <th className="px-4 py-2.5 font-medium">Previsão</th>
            <th className="px-4 py-2.5 font-medium">Responsável</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {deals.map((d) => (
            <tr key={d.id} className="group transition-colors hover:bg-muted/40">
              <td className="max-w-72 px-4 py-2.5">
                <Link href={`/app/deals/${d.id}`} className="block truncate font-medium group-hover:underline">
                  {d.title}
                </Link>
              </td>
              <td className="px-4 py-2.5">
                {d.status === "open" ? <StageBadge name={d.stageName} color={d.stageColor} /> : <DealStatusBadge status={d.status} />}
              </td>
              <td className="px-4 py-2.5 text-right font-medium tabular">{formatBRL(d.valueCents)}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{d.companyName ?? "—"}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{formatDate(d.expectedCloseDate)}</td>
              <td className="px-4 py-2.5">
                {d.ownerName ? (
                  <span className="flex items-center gap-2">
                    <UserAvatar name={d.ownerName} image={d.ownerImage} className="size-5" />
                    <span className="truncate">{d.ownerName}</span>
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile */}
      <ul className="divide-y md:hidden">
        {deals.map((d) => (
          <li key={d.id}>
            <Link href={`/app/deals/${d.id}`} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{d.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  {d.status === "open" ? <StageBadge name={d.stageName} color={d.stageColor} /> : <DealStatusBadge status={d.status} />}
                  {d.companyName && <span className="truncate text-xs text-muted-foreground">{d.companyName}</span>}
                </div>
              </div>
              <span className="text-sm font-semibold tabular">{formatCompactBRL(d.valueCents)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
