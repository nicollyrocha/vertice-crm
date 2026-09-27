"use client"

import { startTransition, useActionState, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormState } from "@/lib/action"
import { cn } from "@/lib/utils"

export function fieldError(state: FormState, name: string) {
  if (!state || state.ok) return undefined
  return state.fieldErrors?.[name]?.[0]
}

export function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
  labelAside,
  ...props
}: React.ComponentProps<typeof Input> & {
  label: string
  name: string
  error?: string
  hint?: React.ReactNode
  labelAside?: React.ReactNode
}) {
  const id = props.id ?? `f-${name}`
  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {labelAside}
      </div>
      {children ?? <Input id={id} name={name} aria-invalid={Boolean(error) || undefined} {...props} />}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

/**
 * Como useActionState, mas sem o reset automático do form do React 19
 * (preserva o que o usuário digitou quando a action retorna erro).
 */
export function useFormAction(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(action, null)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => dispatch(formData))
  }
  return [state, onSubmit, pending] as const
}

export function SubmitButton({
  children,
  className,
  pendingText,
  pending: pendingProp,
  ...props
}: React.ComponentProps<typeof Button> & { pendingText?: string; pending?: boolean }) {
  const status = useFormStatus()
  const pending = pendingProp ?? status.pending
  return (
    <Button type="submit" disabled={pending || props.disabled} className={className} {...props}>
      {pending && <Loader2 className="animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  )
}

export function FormAlert({ state }: { state: FormState }) {
  if (!state) return null
  if (state.ok && !state.message) return null
  const isError = !state.ok
  const text = isError ? state.error : state.message
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-success/30 bg-success/10 text-success",
      )}
    >
      {isError ? <AlertCircle className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
      <span>{text}</span>
    </div>
  )
}

/** Dispara toast quando uma action retorna. Útil em dialogs e settings. */
export function useActionToast(state: FormState, onSuccess?: () => void) {
  const last = useRef<FormState>(null)
  useEffect(() => {
    if (!state || state === last.current) return
    last.current = state
    if (state.ok) {
      if (state.message) toast.success(state.message)
      onSuccess?.()
    } else if (!state.fieldErrors) {
      toast.error(state.error)
    }
  }, [state, onSuccess])
}
