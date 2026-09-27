"use client"

import { useRef } from "react"
import { BadgeCheck, MailWarning } from "lucide-react"
import { PasswordInput } from "@/components/auth/password-input"
import { Field, SubmitButton, fieldError, useActionToast, useFormAction } from "@/components/form"
import { initials } from "@/lib/format"
import {
  changePasswordAction,
  removeAvatarAction,
  requestEmailChangeAction,
  setPasswordAction,
  updateProfileAction,
  uploadAvatarAction,
} from "@/server/actions/account"
import { ImageUpload } from "./image-upload"
import { SettingsSection } from "./section"

type User = { name: string | null; email: string; image: string | null; emailVerified: Date | null; hasPassword: boolean }

export function AvatarSection({ user }: { user: User }) {
  return (
    <SettingsSection title="Foto de perfil" description="Aparece para o seu time em negócios, notas e atividades.">
      <ImageUpload
        current={user.image}
        fallback={<span className="text-muted-foreground">{initials(user.name ?? user.email)}</span>}
        upload={uploadAvatarAction}
        remove={removeAvatarAction}
      />
    </SettingsSection>
  )
}

export function NameSection({ user }: { user: User }) {
  const [state, onSubmit, pending] = useFormAction(updateProfileAction)
  useActionToast(state)
  return (
    <form onSubmit={onSubmit}>
      <SettingsSection
        title="Informações pessoais"
        description="Seu nome como aparece no app."
        footer={
          <SubmitButton pending={pending} size="sm">
            Salvar
          </SubmitButton>
        }
      >
        <Field
          label="Nome completo"
          name="name"
          defaultValue={user.name ?? ""}
          required
          error={fieldError(state, "name")}
          className="max-w-sm"
        />
      </SettingsSection>
    </form>
  )
}

export function EmailSection({ user }: { user: User }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, onSubmit, pending] = useFormAction(requestEmailChangeAction)
  useActionToast(state, () => formRef.current?.reset())
  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <SettingsSection
        title="Email"
        description="Enviaremos um link de confirmação para o novo endereço. O email só muda após a confirmação."
        footer={
          <SubmitButton pending={pending} size="sm" pendingText="Enviando…">
            Alterar email
          </SubmitButton>
        }
      >
        <div className="mb-5 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Atual:</span>
          <span className="font-medium">{user.email}</span>
          {user.emailVerified ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              <BadgeCheck className="size-3" /> Verificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning">
              <MailWarning className="size-3" /> Não verificado
            </span>
          )}
        </div>
        <div className="grid max-w-sm gap-4">
          <Field label="Novo email" name="email" type="email" required autoComplete="email" error={fieldError(state, "email")} />
          {user.hasPassword && (
            <Field label="Confirme com sua senha" name="password" error={fieldError(state, "password")}>
              <PasswordInput id="f-password-email" name="password" autoComplete="current-password" required />
            </Field>
          )}
        </div>
      </SettingsSection>
    </form>
  )
}

export function PasswordSection({ user }: { user: User }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, onSubmit, pending] = useFormAction(user.hasPassword ? changePasswordAction : setPasswordAction)
  useActionToast(state, () => formRef.current?.reset())
  return (
    <form ref={formRef} onSubmit={onSubmit}>
      <SettingsSection
        title={user.hasPassword ? "Senha" : "Definir senha"}
        description={
          user.hasPassword
            ? "Use pelo menos 8 caracteres. Você receberá um aviso por email."
            : "Sua conta usa login social. Defina uma senha para também entrar com email."
        }
        footer={
          <SubmitButton pending={pending} size="sm" pendingText="Salvando…">
            {user.hasPassword ? "Alterar senha" : "Definir senha"}
          </SubmitButton>
        }
      >
        <div className="grid max-w-sm gap-4">
          {user.hasPassword && (
            <Field label="Senha atual" name="current" error={fieldError(state, "current")}>
              <PasswordInput id="f-current" name="current" autoComplete="current-password" required />
            </Field>
          )}
          <Field label="Nova senha" name="password" error={fieldError(state, "password")}>
            <PasswordInput id="f-new" name="password" autoComplete="new-password" minLength={8} required />
          </Field>
          {user.hasPassword && (
            <Field label="Confirmar nova senha" name="confirm" error={fieldError(state, "confirm")}>
              <PasswordInput id="f-confirm" name="confirm" autoComplete="new-password" required />
            </Field>
          )}
        </div>
      </SettingsSection>
    </form>
  )
}
