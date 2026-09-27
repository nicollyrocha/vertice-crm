"use client"

import Link from "next/link"
import { useOptimistic, useTransition } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/app/user-avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"
import { deleteActivityAction, toggleActivityAction } from "@/server/actions/activities"
import type { ActivityRow } from "@/server/data/activities"
import { ActivityIcon } from "./activity-icon"
import { activityTypeLabels } from "./badges"

export function ActivityItem({
  activity: a,
  onEdit,
  showLinks = true,
}: {
  activity: ActivityRow
  onEdit?: (a: ActivityRow) => void
  showLinks?: boolean
}) {
  const [done, setDone] = useOptimistic(Boolean(a.completedAt))
  const [, start] = useTransition()
  const overdue = !done && a.dueAt && new Date(a.dueAt) < new Date()

  const link =
    (a.dealId && { href: `/app/deals/${a.dealId}`, label: a.dealTitle }) ||
    (a.contactId && { href: `/app/contacts/${a.contactId}`, label: a.contactName }) ||
    (a.companyId && { href: `/app/companies/${a.companyId}`, label: a.companyName }) ||
    null

  return (
    <div className={cn("group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40", done && "opacity-60")}>
      <Checkbox
        checked={done}
        className="mt-1 size-4.5 rounded-full"
        aria-label={done ? "Reabrir atividade" : "Concluir atividade"}
        onCheckedChange={(v) =>
          start(async () => {
            setDone(Boolean(v))
            const r = await toggleActivityAction(a.id, Boolean(v))
            if (!r.ok) toast.error(r.error)
            else toast.success(r.message)
          })
        }
      />
      <ActivityIcon type={a.type} className="mt-0.5 hidden sm:grid" />
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-medium", done && "line-through")}>{a.title}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>{activityTypeLabels[a.type]}</span>
          {a.dueAt && (
            <>
              <span aria-hidden>·</span>
              <span className={cn(overdue && "font-medium text-destructive")}>
                {overdue ? "Atrasada · " : ""}
                {formatDateTime(a.dueAt)}
              </span>
            </>
          )}
          {showLinks && link && (
            <>
              <span aria-hidden>·</span>
              <Link href={link.href} className="truncate hover:text-foreground hover:underline">
                {link.label}
              </Link>
            </>
          )}
        </div>
      </div>
      {a.assigneeName && (
        <UserAvatar name={a.assigneeName} image={a.assigneeImage} className="mt-0.5 hidden size-6 sm:flex" />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Ações"
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onSelect={() => onEdit(a)}>
              <Pencil /> Editar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() =>
              start(async () => {
                const r = await deleteActivityAction(a.id)
                if (r.ok) toast.success(r.message)
              })
            }
          >
            <Trash2 /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
