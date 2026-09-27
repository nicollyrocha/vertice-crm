"use client"

import { useState } from "react"
import { Field, FormAlert, SubmitButton, fieldError, useFormAction } from "@/components/form"
import { forgotPasswordAction, resetPasswordAction } from "@/server/actions/auth"
import { PasswordInput, PasswordStrength } from "./password-input"

export function ForgotPasswordForm() {
  const [state, onSubmit, pending] = useFormAction(forgotPasswordAction)
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <FormAlert state={state} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        error={fieldError(state, "email")}
        required
        className="[&_input]:h-10"
      />
      <SubmitButton pending={pending} size="lg" className="h-10" pendingText="Enviando…">
        Enviar link de redefinição
      </SubmitButton>
    </form>
  )
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, onSubmit, pending] = useFormAction(resetPasswordAction)
  const [pwd, setPwd] = useState("")
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FormAlert state={state} />
      <Field label="Nova senha" name="password" error={fieldError(state, "password")}>
        <PasswordInput
          id="f-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
      </Field>
      <PasswordStrength value={pwd} />
      <Field label="Confirmar nova senha" name="confirm" error={fieldError(state, "confirm")}>
        <PasswordInput id="f-confirm" name="confirm" autoComplete="new-password" required className="h-10" />
      </Field>
      <SubmitButton pending={pending} size="lg" className="h-10" pendingText="Salvando…">
        Redefinir senha
      </SubmitButton>
    </form>
  )
}
