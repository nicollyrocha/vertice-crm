"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { appUrl } from "@/env"
import { db } from "@/db"
import { users } from "@/db/schema"
import { fail, fromZod, ok, type FormState } from "@/lib/action"
import { hashPassword, verifyPassword } from "@/lib/password"
import { changeEmailSchema, changePasswordSchema, profileSchema } from "@/lib/validations/auth"
import { issueToken } from "@/server/auth-tokens"
import { requireUser } from "@/server/context"
import { sendEmail } from "@/server/email/send"
import { templates } from "@/server/email/templates"
import { rateLimit } from "@/server/rate-limit"
import { deleteImage, uploadImage } from "@/server/upload"

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  await db.update(users).set({ name: parsed.data.name }).where(eq(users.id, user.id))
  revalidatePath("/app", "layout")
  return ok(undefined, "Perfil atualizado.")
}

export async function uploadAvatarAction(formData: FormData): Promise<FormState> {
  const user = await requireUser()
  const result = await uploadImage(formData.get("file"), `avatars/${user.id}`)
  if (!result.ok) return fail(result.error)
  await db.update(users).set({ image: result.url }).where(eq(users.id, user.id))
  await deleteImage(user.image)
  revalidatePath("/app", "layout")
  return ok(undefined, "Foto atualizada.")
}

export async function removeAvatarAction(): Promise<FormState> {
  const user = await requireUser()
  await db.update(users).set({ image: null }).where(eq(users.id, user.id))
  await deleteImage(user.image)
  revalidatePath("/app", "layout")
  return ok(undefined, "Foto removida.")
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)

  if (!(await rateLimit(`pwd:${user.id}`, 5, 60 * 15))) return fail("Muitas tentativas. Aguarde alguns minutos.")
  if (!user.passwordHash || !(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return fail("Senha atual incorreta.", { current: ["Senha atual incorreta"] })
  }
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password) })
    .where(eq(users.id, user.id))
  await sendEmail({ to: user.email, ...templates.passwordChangedNotice() })
  return ok(undefined, "Senha alterada com sucesso.")
}

/** Define senha para contas criadas via OAuth (sem senha). */
export async function setPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser()
  if (user.passwordHash) return fail("Sua conta já possui senha.")
  const password = String(formData.get("password") ?? "")
  if (password.length < 8) return fail("A senha deve ter pelo menos 8 caracteres.", { password: ["Mínimo 8 caracteres"] })
  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, user.id))
  revalidatePath("/app/settings/profile")
  return ok(undefined, "Senha definida.")
}

export async function requestEmailChangeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = changeEmailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  const { email, password } = parsed.data

  if (email === user.email) return fail("Este já é o seu email.", { email: ["Informe um email diferente"] })
  if (user.passwordHash && !(password && (await verifyPassword(password, user.passwordHash)))) {
    return fail("Senha incorreta.", { password: ["Senha incorreta"] })
  }
  if (!(await rateLimit(`email-change:${user.id}`, 3, 60 * 60))) return fail("Muitas tentativas. Tente mais tarde.")

  const taken = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } })
  if (taken) return fail("Este email já está em uso.", { email: ["Email já em uso"] })

  const token = await issueToken(user.id, "email_change", 60 * 24, { newEmail: email })
  await sendEmail({ to: email, ...templates.changeEmail(email, `${appUrl()}/verify-email?token=${token}`) })
  return ok(undefined, `Enviamos um link de confirmação para ${email}.`)
}
