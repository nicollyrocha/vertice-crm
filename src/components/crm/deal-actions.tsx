"use client"

import { useState, useTransition } from "react"
import { CircleCheck, CircleX, MoreHorizontal, Pencil, RotateCcw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteDealAction, setDealStatusAction } from "@/server/actions/deals"
import { ConfirmAction } from "./confirm-button"
import { DealDialog, type DealFormOptions, type DealFormValues } from "./entity-forms"

export function DealActions({
  deal,
  status,
  options,
}: {
  deal: DealFormValues & { id: string }
  status: "open" | "won" | "lost"
  options: DealFormOptions
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [pending, start] = useTransition()

  const setStatus = (s: "open" | "won" | "lost") =>
    start(async () => {
      const r = await setDealStatusAction(deal.id, s)
      if (r.ok) toast.success(r.message)
      else toast.error(r.error)
    })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "open" ? (
        <>
          <Button
            variant="outline"
            className="border-success/40 text-success hover:bg-success/10 hover:text-success"
            disabled={pending}
            onClick={() => setStatus("won")}
          >
            <CircleCheck /> Ganho
          </Button>
          <Button
            variant="outline"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={pending}
            onClick={() => setStatus("lost")}
          >
            <CircleX /> Perdido
          </Button>
        </>
      ) : (
        <Button variant="outline" disabled={pending} onClick={() => setStatus("open")}>
          <RotateCcw /> Reabrir
        </Button>
      )}
      <Button variant="outline" onClick={() => setEditOpen(true)}>
        <Pencil /> Editar
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Mais ações">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil /> Editar negócio
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <ConfirmAction
            title="Excluir negócio?"
            description="O negócio, suas notas e atividades serão removidos permanentemente."
            onConfirm={() => deleteDealAction(deal.id, "/app/deals")}
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <Trash2 /> Excluir
              </DropdownMenuItem>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <DealDialog open={editOpen} onOpenChange={setEditOpen} deal={deal} options={options} />
    </div>
  )
}
