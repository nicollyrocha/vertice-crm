"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Building2, CalendarClock, Plus } from "lucide-react"
import { toast } from "sonner"
import { UserAvatar } from "@/components/app/user-avatar"
import { Button } from "@/components/ui/button"
import type { Stage } from "@/db/schema"
import { formatCompactBRL, formatBRL, formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { moveDealAction } from "@/server/actions/deals"
import type { DealRow } from "@/server/data/deals"
import { colorOf } from "./badges"

type Columns = Record<string, DealRow[]>

function group(stages: Stage[], deals: DealRow[]): Columns {
  const cols: Columns = Object.fromEntries(stages.map((s) => [s.id, []]))
  for (const d of deals) cols[d.stageId]?.push(d)
  return cols
}

function DealCard({ deal, overlay }: { deal: DealRow; overlay?: boolean }) {
  const overdue = deal.expectedCloseDate && deal.status === "open" && new Date(deal.expectedCloseDate) < new Date()
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 text-left shadow-xs transition-shadow",
        overlay ? "rotate-2 cursor-grabbing shadow-xl ring-2 ring-brand/40" : "hover:shadow-md",
      )}
    >
      <Link
        href={`/app/deals/${deal.id}`}
        className="line-clamp-2 text-[13.5px] font-medium leading-snug hover:underline"
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        {deal.title}
      </Link>
      {deal.companyName && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="size-3" />
          <span className="truncate">{deal.companyName}</span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tabular">{formatBRL(deal.valueCents)}</span>
        <div className="flex items-center gap-1.5">
          {deal.expectedCloseDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground",
                overdue && "bg-destructive/10 text-destructive",
              )}
              title="Previsão de fechamento"
            >
              <CalendarClock className="size-3" />
              {formatDate(deal.expectedCloseDate).replace(/ \d{4}$/, "")}
            </span>
          )}
          {deal.ownerName && <UserAvatar name={deal.ownerName} image={deal.ownerImage} className="size-5" />}
        </div>
      </div>
    </div>
  )
}

function SortableDeal({ deal }: { deal: DealRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { stageId: deal.stageId },
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("cursor-grab touch-manipulation active:cursor-grabbing", isDragging && "opacity-40")}
      {...attributes}
      {...listeners}
    >
      <DealCard deal={deal} />
    </div>
  )
}

function Column({
  stage,
  deals,
  onCreate,
}: {
  stage: Stage
  deals: DealRow[]
  onCreate: (stageId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { stageId: stage.id } })
  const total = deals.reduce((sum, d) => sum + d.valueCents, 0)
  const c = colorOf(stage.color)
  return (
    <div className="flex w-[82vw] max-w-[300px] shrink-0 snap-start flex-col sm:w-72">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className={cn("size-2 rounded-full", c.dot)} />
        <span className="text-sm font-medium">{stage.name}</span>
        <span className="rounded-full bg-muted px-1.5 text-[11px] font-medium tabular text-muted-foreground">{deals.length}</span>
        <span className="ml-auto text-xs font-medium tabular text-muted-foreground">{formatCompactBRL(total)}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-40 flex-1 flex-col gap-2 rounded-2xl border border-transparent bg-muted/50 p-2 transition-colors",
          isOver && "border-brand/40 bg-brand-soft/50",
        )}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((d) => (
            <SortableDeal key={d.id} deal={d} />
          ))}
        </SortableContext>
        <button
          type="button"
          onClick={() => onCreate(stage.id)}
          className="flex h-9 items-center justify-center gap-1.5 rounded-xl text-xs text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
        >
          <Plus className="size-3.5" /> Adicionar
        </button>
      </div>
    </div>
  )
}

export function DealsBoard({
  stages,
  deals,
  onCreate,
}: {
  stages: Stage[]
  deals: DealRow[]
  onCreate: (stageId: string) => void
}) {
  const initial = useMemo(() => group(stages, deals), [stages, deals])
  const [cols, setCols] = useState<Columns>(initial)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, start] = useTransition()

  // Sincroniza quando o servidor revalida (estado derivado de props, sem effect).
  const [synced, setSynced] = useState(initial)
  if (synced !== initial) {
    setSynced(initial)
    setCols(initial)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const findStage = (id: string) => (id in cols ? id : Object.keys(cols).find((k) => cols[k].some((d) => d.id === id)))
  const active = activeId ? Object.values(cols).flat().find((d) => d.id === activeId) : null

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const from = findStage(String(active.id))
    const to = findStage(String(over.id))
    if (!from || !to || from === to) return
    setCols((prev) => {
      const moving = prev[from].find((d) => d.id === active.id)
      if (!moving) return prev
      const target = [...prev[to]]
      const overIndex = target.findIndex((d) => d.id === over.id)
      target.splice(overIndex >= 0 ? overIndex : target.length, 0, { ...moving, stageId: to })
      return { ...prev, [from]: prev[from].filter((d) => d.id !== active.id), [to]: target }
    })
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const stageId = findStage(String(active.id))
    if (!stageId) return
    const list = cols[stageId]
    const oldIndex = list.findIndex((d) => d.id === active.id)
    const overIndex = list.findIndex((d) => d.id === over.id)
    const newIndex = overIndex >= 0 ? overIndex : list.length - 1
    const reordered = [...list]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    const snapshot = cols
    setCols({ ...cols, [stageId]: reordered })

    start(async () => {
      const r = await moveDealAction(String(active.id), stageId, newIndex)
      if (!r.ok) {
        setCols(snapshot)
        toast.error(r.error)
      } else if (stages.find((s) => s.id === stageId)?.isWon && moved.stageId !== initialStage(moved.id)) {
        toast.success("Negócio ganho! 🎉")
      }
    })
  }

  const initialStage = (id: string) => deals.find((d) => d.id === id)?.stageId

  return (
    <DndContext
      id="deals-board"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActiveId(null)
        setCols(initial)
      }}
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:snap-none lg:px-8">
        {stages.map((s) => (
          <Column key={s.id} stage={s} deals={cols[s.id] ?? []} onCreate={onCreate} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {active ? <DealCard deal={active} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

export function EmptyBoardHint() {
  return (
    <div className="mb-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
      Dica: arraste os cards entre as colunas para atualizar o estágio. No celular, toque e segure.
      <Button variant="link" size="sm" className="px-1" asChild>
        <Link href="/app/settings/pipeline">Personalizar estágios</Link>
      </Button>
    </div>
  )
}
