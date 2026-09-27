"use client"

import { Field, FormAlert, SubmitButton, fieldError, useFormAction } from "@/components/form"
import { createOrgAction } from "@/server/actions/org"

export function OnboardingForm() {
  const [state, onSubmit, pending] = useFormAction(createOrgAction)
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormAlert state={state} />
      <Field
        label="Nome da empresa"
        name="name"
        placeholder="Acme Ltda"
        autoFocus
        required
        error={fieldError(state, "name")}
        hint="Você pode alterar isso depois nas configurações."
        className="[&_input]:h-10"
      />
      <div className="rounded-xl border bg-muted/40 p-4 text-sm">
        <div className="font-medium">Pipeline incluído</div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Lead", "Qualificado", "Proposta", "Negociação", "Ganho"].map((s) => (
            <span key={s} className="rounded-full border bg-background px-2.5 py-0.5 text-xs">
              {s}
            </span>
          ))}
        </div>
      </div>
      <SubmitButton pending={pending} size="lg" className="h-10" pendingText="Criando workspace…">
        Criar workspace
      </SubmitButton>
    </form>
  )
}
