"use client"

import Link from "next/link"
import { useState } from "react"
import { Field, FormAlert, SubmitButton, fieldError, useFormAction } from "@/components/form"
import { signUpAction } from "@/server/actions/auth"
import { PasswordInput, PasswordStrength } from "./password-input"

export function SignupForm({ callbackUrl, email }: { callbackUrl?: string; email?: string }) {
  const [state, onSubmit, pending] = useFormAction(signUpAction)
  const [pwd, setPwd] = useState("")
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <FormAlert state={state} />
      <Field
        label="Nome completo"
        name="name"
        autoComplete="name"
        placeholder="Ana Souza"
        error={fieldError(state, "name")}
        required
        className="[&_input]:h-10"
      />
      <Field
        label="Email de trabalho"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        defaultValue={email}
        error={fieldError(state, "email")}
        required
        className="[&_input]:h-10"
      />
      <Field label="Senha" name="password" error={fieldError(state, "password")}>
        <PasswordInput
          id="f-password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="h-10"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Mínimo de 8 caracteres"
        />
      </Field>
      <PasswordStrength value={pwd} />
      <SubmitButton pending={pending} size="lg" className="mt-1 h-10" pendingText="Criando conta…">
        Criar conta grátis
      </SubmitButton>
      <p className="text-center text-xs text-muted-foreground">
        Ao continuar você concorda com os{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
          Termos
        </Link>{" "}
        e a{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          Política de Privacidade
        </Link>
        .
      </p>
    </form>
  )
}
