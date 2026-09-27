"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { ActionResult } from "@/lib/action"

/** Botão com confirmação para ações destrutivas. */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel = "Excluir",
  onConfirm,
}: {
  trigger: React.ReactNode
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<ActionResult | void>
}) {
  const [pending, start] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await onConfirm()
                if (!r) return
                if (r.ok) {
                  if (r.message) toast.success(r.message)
                } else toast.error(r.error)
              })
            }
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
