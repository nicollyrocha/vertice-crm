import { CalendarDays, CheckSquare, Mail, Phone } from "lucide-react"
import type { ActivityType } from "@/db/schema"
import { cn } from "@/lib/utils"

const map = {
  task: { icon: CheckSquare, cls: "bg-violet-500/10 text-violet-600 dark:text-violet-300" },
  call: { icon: Phone, cls: "bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  meeting: { icon: CalendarDays, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-300" },
  email: { icon: Mail, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300" },
}

export function ActivityIcon({ type, className }: { type: ActivityType; className?: string }) {
  const { icon: Icon, cls } = map[type]
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", cls, className)}>
      <Icon className="size-3.5" />
    </span>
  )
}
