"use client"

import { useState, useTransition } from "react"
import { ArrowDown, ArrowUp, Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { colorOf, stageColorNames } from "@/components/crm/badges"
import { FormDialog } from "@/components/crm/form-dialog"
import { Field, fieldError } from "@/components/form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { ActionResult } from "@/lib/action"
import { cn } from "@/lib/utils"
import { deleteStageAction, moveStageAction, saveStageAction } from "@/server/actions/pipeline"

type StageRow = { id: string; name: string; probability: number; color: string; isWon: boolean; dealCount: number }

function StageDialog({
  stage,
  open,
  onOpenChange,
}: {
  stage?: StageRow
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={stage ? "Editar estágio" : "Novo estágio"}
      action={saveStageAction}
      submitLabel={stage ? "Salvar" : "Criar estágio"}
    >
      {(state) => (
        <>
          {stage && <input type="hidden" name="id" value={stage.id} />}
          <Field label="Nome" name="name" defaultValue={stage?.name} required autoFocus error={fieldError(state, "name")} />
          <Field
            label="Probabilidade de fechamento (%)"
            name="probability"
            type="number"
            min={0}
            max={100}
            defaultValue={stage?.probability ?? 50}
            required
            error={fieldError(state, "probability")}
            hint="Usada na previsão de receita ponderada."
          />
          <div className="grid gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {stageColorNames.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="color" value={c} defaultChecked={(stage?.color ?? "violet") === c} className="peer sr-only" />
                  <span
                    className={cn(
                      "block size-7 rounded-full ring-offset-2 ring-offset-background transition peer-checked:ring-2 peer-checked:ring-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                      colorOf(c).dot,
                    )}
                    title={c}
                  />
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </FormDialog>
  )
}

export function PipelineEditor({ stages, canManage }: { stages: StageRow[]; canManage: boolean }) {
  const [editing, setEditing] = useState<StageRow | null>(null)
  const [creating, setCreating] = useState(false)
  const [pending, start] = useTransition()
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const r = await fn()
      if (!r.ok) toast.error(r.error)
      else if (r.message) toast.success(r.message)
    })

  return (
    <div className="space-y-3">
      <ol className="divide-y overflow-hidden rounded-xl border">
        {stages.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3 bg-card px-3 py-2.5">
            <span className="w-5 text-center text-xs tabular text-muted-foreground">{i + 1}</span>
            <span className={cn("size-2.5 rounded-full", colorOf(s.color).dot)} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                {s.name}
                {s.isWon && <Lock className="size-3 text-muted-foreground" aria-label="Estágio de ganho" />}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.probability}% · {s.dealCount} negócio{s.dealCount === 1 ? "" : "s"}
              </div>
            </div>
            {canManage && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending || i === 0}
                  onClick={() => run(() => moveStageAction(s.id, "up"))}
                  aria-label="Mover para cima"
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending || i === stages.length - 1}
                  onClick={() => run(() => moveStageAction(s.id, "down"))}
                  aria-label="Mover para baixo"
                >
                  <ArrowDown />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} aria-label="Editar">
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pending || s.isWon}
                  onClick={() => run(() => deleteStageAction(s.id))}
                  aria-label="Remover"
                >
                  <Trash2 />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ol>
      {canManage ? (
        <Button variant="outline" onClick={() => setCreating(true)}>
          <Plus /> Adicionar estágio
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">Apenas administradores podem editar o pipeline.</p>
      )}
      <StageDialog open={creating} onOpenChange={setCreating} />
      <StageDialog key={editing?.id} open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)} stage={editing ?? undefined} />
    </div>
  )
}
