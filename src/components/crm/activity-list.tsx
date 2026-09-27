"use client"

import { useState } from "react"
import { CalendarCheck, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ActivityRow } from "@/server/data/activities"
import { ActivityItem } from "./activity-item"
import { ActivityDialog, type ActivityFormValues, type Option } from "./entity-forms"

/** Lista de atividades de uma entidade (negócio/contato/empresa) com criação e edição. */
export function EntityActivities({
  activities,
  members,
  refs,
}: {
  activities: ActivityRow[]
  members: Option[]
  refs: { dealId?: string; contactId?: string; companyId?: string }
}) {
  const [editing, setEditing] = useState<ActivityFormValues | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <span className="text-sm font-medium">
          Atividades <span className="text-muted-foreground">({activities.length})</span>
        </span>
        <Button size="sm" variant="ghost" onClick={() => setCreating(true)}>
          <Plus /> Adicionar
        </Button>
      </div>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
          <CalendarCheck className="size-5" />
          Nenhuma atividade. Agende o próximo passo para não perder o timing.
        </div>
      ) : (
        <div className="divide-y">
          {activities.map((a) => (
            <ActivityItem key={a.id} activity={a} showLinks={false} onEdit={(x) => setEditing(x)} />
          ))}
        </div>
      )}
      <ActivityDialog open={creating} onOpenChange={setCreating} members={members} activity={refs} />
      <ActivityDialog
        open={Boolean(editing)}
        onOpenChange={(o) => !o && setEditing(null)}
        members={members}
        activity={editing ?? undefined}
      />
    </div>
  )
}
