import { ArrowRightLeft, CalendarPlus, CircleCheck, CircleX, Pencil, Plus, RotateCcw } from "lucide-react"
import { formatRelative } from "@/lib/format"
import type { TimelineItem } from "@/server/data/timeline"

const actions: Record<string, { icon: React.ComponentType<{ className?: string }>; text: (m: Record<string, unknown> | null) => string }> = {
  created: { icon: Plus, text: (m) => `criou este registro${m?.value ? ` (${m.value})` : ""}` },
  updated: { icon: Pencil, text: () => "atualizou os dados" },
  stage_changed: { icon: ArrowRightLeft, text: (m) => `moveu para ${String(m?.to ?? "outro estágio")}` },
  status_won: { icon: CircleCheck, text: () => "marcou como ganho 🎉" },
  status_lost: { icon: CircleX, text: () => "marcou como perdido" },
  status_open: { icon: RotateCcw, text: () => "reabriu o negócio" },
  activity_added: { icon: CalendarPlus, text: (m) => `agendou “${String(m?.title ?? "atividade")}”` },
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Sem histórico ainda.</p>
  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-border">
      {items.map((it) => {
        const a = actions[it.action] ?? { icon: Pencil, text: () => it.action }
        return (
          <li key={it.id} className="relative flex gap-3">
            <span className="z-10 grid size-6 shrink-0 place-items-center rounded-full border bg-background text-muted-foreground">
              <a.icon className="size-3" />
            </span>
            <div className="pt-0.5 text-sm">
              <span className="font-medium">{it.actorName ?? "Alguém"}</span>{" "}
              <span className="text-muted-foreground">{a.text(it.meta)}</span>
              <div className="text-xs text-muted-foreground/80">{formatRelative(it.createdAt)}</div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
