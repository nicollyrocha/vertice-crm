import type { ActivityType } from "@/db/schema"
import { cn } from "@/lib/utils"

export const stageColors: Record<string, { dot: string; soft: string; bar: string }> = {
  slate: { dot: "bg-slate-400", soft: "bg-slate-500/10 text-slate-700 dark:text-slate-300", bar: "var(--color-slate-400)" },
  sky: { dot: "bg-sky-500", soft: "bg-sky-500/10 text-sky-700 dark:text-sky-300", bar: "var(--color-sky-500)" },
  violet: { dot: "bg-violet-500", soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300", bar: "var(--color-violet-500)" },
  amber: { dot: "bg-amber-500", soft: "bg-amber-500/10 text-amber-700 dark:text-amber-300", bar: "var(--color-amber-500)" },
  emerald: { dot: "bg-emerald-500", soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", bar: "var(--color-emerald-500)" },
  rose: { dot: "bg-rose-500", soft: "bg-rose-500/10 text-rose-700 dark:text-rose-300", bar: "var(--color-rose-500)" },
  indigo: { dot: "bg-indigo-500", soft: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300", bar: "var(--color-indigo-500)" },
}

export const stageColorNames = Object.keys(stageColors)

export function colorOf(color: string | null | undefined) {
  return stageColors[color ?? ""] ?? stageColors.slate
}

export function StageBadge({ name, color, className }: { name: string; color: string; className?: string }) {
  const c = colorOf(color)
  return (
    <span
      className={cn(
        "inline-flex h-5.5 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium",
        c.soft,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {name}
    </span>
  )
}

const statusMap = {
  open: { label: "Aberto", cls: "bg-sky-500/10 text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  won: { label: "Ganho", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  lost: { label: "Perdido", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
}

export function DealStatusBadge({ status }: { status: "open" | "won" | "lost" }) {
  const s = statusMap[status]
  return (
    <span className={cn("inline-flex h-5.5 items-center gap-1.5 rounded-full px-2 text-xs font-medium", s.cls)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  )
}

export const activityTypeLabels: Record<ActivityType, string> = {
  task: "Tarefa",
  call: "Ligação",
  meeting: "Reunião",
  email: "Email",
}
