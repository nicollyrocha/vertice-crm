"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { AlertTriangle, CalendarCheck, CalendarDays, CheckCircle2, Clock, Plus } from "lucide-react"
import { PageHeader } from "@/components/app/page-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ActivityRow } from "@/server/data/activities"
import { ActivityItem } from "./activity-item"
import { ActivityDialog, type ActivityFormValues, type Option } from "./entity-forms"

type Groups = { overdue: ActivityRow[]; today: ActivityRow[]; upcoming: ActivityRow[]; done: ActivityRow[] }

const sections = [
  { key: "overdue", title: "Atrasadas", icon: AlertTriangle, tone: "text-destructive" },
  { key: "today", title: "Hoje", icon: Clock, tone: "text-brand" },
  { key: "upcoming", title: "Próximas", icon: CalendarDays, tone: "text-muted-foreground" },
  { key: "done", title: "Concluídas recentemente", icon: CheckCircle2, tone: "text-success" },
] as const

export function ActivitiesView({
  groups,
  members,
  deals,
  mine,
}: {
  groups: Groups
  members: Option[]
  deals: Option[]
  mine: boolean
}) {
  const pathname = usePathname()
  const params = useSearchParams()
  const [creating, setCreating] = useState(params.get("new") === "1")
  const [editing, setEditing] = useState<ActivityFormValues | null>(null)
  const pending = groups.overdue.length + groups.today.length + groups.upcoming.length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Atividades"
        description={`${pending} pendente${pending === 1 ? "" : "s"} · ${groups.overdue.length} atrasada${groups.overdue.length === 1 ? "" : "s"}`}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Nova atividade
          </Button>
        }
      />

      <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
        {[
          [true, "Minhas"],
          [false, "Do time"],
        ].map(([v, label]) => (
          <Link
            key={String(v)}
            href={v ? pathname : `${pathname}?scope=all`}
            className={cn(
              "inline-flex h-7 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors",
              mine === v && "bg-background text-foreground shadow-sm",
            )}
          >
            {label as string}
          </Link>
        ))}
      </div>

      {pending === 0 && groups.done.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <CalendarCheck className="size-8 text-success" />
          <div className="text-base font-semibold">Nada por aqui</div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Agende ligações, reuniões e tarefas para manter cada negócio andando.
          </p>
          <Button onClick={() => setCreating(true)} className="mt-2">
            <Plus /> Agendar atividade
          </Button>
        </div>
      ) : (
        sections.map((s) => {
          const items = groups[s.key]
          if (items.length === 0) return null
          return (
            <section key={s.key}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
                <s.icon className={cn("size-4", s.tone)} /> {s.title}
                <span className="rounded-full bg-muted px-1.5 text-[11px] tabular text-muted-foreground">{items.length}</span>
              </h2>
              <div
                className={cn(
                  "divide-y overflow-hidden rounded-2xl border bg-card",
                  s.key === "overdue" && "border-destructive/30",
                )}
              >
                {items.map((a) => (
                  <ActivityItem key={a.id} activity={a} onEdit={(x) => setEditing(x)} />
                ))}
              </div>
            </section>
          )
        })
      )}

      <ActivityDialog open={creating} onOpenChange={setCreating} members={members} deals={deals} />
      <ActivityDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        members={members}
        deals={deals}
        activity={editing ?? undefined}
      />
    </div>
  )
}
