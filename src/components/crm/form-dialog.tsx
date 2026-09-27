"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormAlert, SubmitButton, useActionToast, useFormAction } from "@/components/form"
import type { FormState } from "@/lib/action"

export type FormAction = (prev: FormState, formData: FormData) => Promise<FormState>

/**
 * Dialog com formulário ligado a uma server action.
 * Fecha e mostra toast em caso de sucesso; mostra erros por campo caso contrário.
 */
export function FormDialog({
  trigger,
  title,
  description,
  action,
  submitLabel = "Salvar",
  children,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
}: {
  trigger?: React.ReactNode
  title: string
  description?: string
  action: FormAction
  submitLabel?: string
  children: (state: FormState) => React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (state: FormState) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  // remonta o form a cada abertura (limpa estado anterior)
  const [key, setKey] = useState(0)

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (o) setKey((k) => k + 1)
        setOpen(o)
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogForm
          key={key}
          action={action}
          submitLabel={submitLabel}
          onDone={(s) => {
            setOpen(false)
            onSuccess?.(s)
          }}
          onCancel={() => setOpen(false)}
        >
          {children}
        </DialogForm>
      </DialogContent>
    </Dialog>
  )
}

function DialogForm({
  action,
  submitLabel,
  onDone,
  onCancel,
  children,
}: {
  action: FormAction
  submitLabel: string
  onDone: (s: FormState) => void
  onCancel: () => void
  children: (state: FormState) => React.ReactNode
}) {
  const [state, onSubmit, pending] = useFormAction(action)
  const done = useCallback(() => onDone(state), [onDone, state])
  useActionToast(state, done)
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {state && !state.ok && state.fieldErrors && <FormAlert state={state} />}
      {children(state)}
      <DialogFooter className="mt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <SubmitButton pending={pending} pendingText="Salvando…">
          {submitLabel}
        </SubmitButton>
      </DialogFooter>
    </form>
  )
}
