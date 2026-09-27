"use client"

import Link from "next/link"
import { Field, FormAlert, SubmitButton, fieldError, useFormAction } from "@/components/form"
import { signInAction } from "@/server/actions/auth"
import { PasswordInput } from "./password-input"

export function LoginForm({ callbackUrl, defaults }: { callbackUrl?: string; defaults?: { email: string; password: string } }) {
  const [state, onSubmit, pending] = useFormAction(signInAction)
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <FormAlert state={state} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        defaultValue={defaults?.email}
        error={fieldError(state, "email")}
        required
        className="[&_input]:h-10"
      />
      <Field
        label="Senha"
        name="password"
        error={fieldError(state, "password")}
        labelAside={
          <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Esqueceu a senha?
          </Link>
        }
      >
        <PasswordInput
          id="f-password"
          name="password"
          autoComplete="current-password"
          defaultValue={defaults?.password}
          required
          className="h-10"
        />
      </Field>
      <SubmitButton pending={pending} size="lg" className="mt-1 h-10" pendingText="Entrando…">
        Entrar
      </SubmitButton>
    </form>
  )
}
