"use server"

import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import { and, eq, isNull } from "drizzle-orm"
import { signIn, signOut } from "@/auth"
import { appUrl } from "@/env"
import { db } from "@/db"
import { authTokens, users } from "@/db/schema"
import { fail, fromZod, ok, type FormState } from "@/lib/action"
import { hashPassword } from "@/lib/password"
import { forgotPasswordSchema, resetPasswordSchema, signInSchema, signUpSchema } from "@/lib/validations/auth"
import { consumeToken, issueToken } from "@/server/auth-tokens"
import { getCurrentUser } from "@/server/context"
import { sendEmail } from "@/server/email/send"
import { templates } from "@/server/email/templates"
import { rateLimit } from "@/server/rate-limit"

/** Aceita apenas caminhos relativos internos (evita open redirect). */
function safeCallback(raw: FormDataEntryValue | null, fallback: string) {
  const v = typeof raw === "string" ? raw : ""
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback
}

async function sendVerificationEmail(user: { id: string; name: string | null; email: string }) {
  const token = await issueToken(user.id, "email_verify", 60 * 24)
  await sendEmail({ to: user.email, ...templates.verifyEmail(user.name, `${appUrl()}/verify-email?token=${token}`) })
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  const { name, email, password } = parsed.data

  if (!(await rateLimit(`signup:${email}`, 5, 60 * 60))) return fail("Muitas tentativas. Tente novamente mais tarde.")

  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } })
  if (existing) return fail("Já existe uma conta com este email.", { email: ["Email já cadastrado"] })

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .returning()
  await sendVerificationEmail(user)

  await signIn("credentials", { email, password, redirectTo: safeCallback(formData.get("callbackUrl"), "/onboarding") })
  return ok()
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  try {
    await signIn("credentials", { ...parsed.data, redirectTo: safeCallback(formData.get("callbackUrl"), "/app") })
    return ok()
  } catch (error) {
    if (error instanceof AuthError) {
      const code = (error as AuthError & { code?: string }).code
      if (code === "rate_limited") return fail("Muitas tentativas. Aguarde alguns minutos.")
      return fail("Email ou senha incorretos.")
    }
    throw error // NEXT_REDIRECT em caso de sucesso
  }
}

export async function oauthSignInAction(formData: FormData) {
  const provider = String(formData.get("provider"))
  if (provider !== "google" && provider !== "github") return
  await signIn(provider, { redirectTo: safeCallback(formData.get("callbackUrl"), "/app") })
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" })
}

export async function forgotPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  const { email } = parsed.data
  // Resposta sempre igual: não revela se o email existe.
  const generic = ok(undefined, "Se existir uma conta com este email, enviaremos um link em instantes.")

  if (!(await rateLimit(`forgot:${email}`, 3, 60 * 15))) return generic

  const user = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (user) {
    const token = await issueToken(user.id, "password_reset", 60)
    await sendEmail({ to: email, ...templates.resetPassword(`${appUrl()}/reset-password?token=${token}`) })
  }
  return generic
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)

  const row = await consumeToken(parsed.data.token, ["password_reset"])
  if (!row) return fail("Link inválido ou expirado. Solicite um novo.")

  const now = new Date()
  await db.batch([
    // Resetar via email também comprova a posse do endereço.
    db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.password), emailVerified: now })
      .where(eq(users.id, row.userId)),
    db
      .update(authTokens)
      .set({ usedAt: now })
      .where(and(eq(authTokens.userId, row.userId), eq(authTokens.type, "password_reset"), isNull(authTokens.usedAt))),
  ])
  const user = await db.query.users.findFirst({ where: eq(users.id, row.userId) })
  if (user) await sendEmail({ to: user.email, ...templates.passwordChangedNotice() })
  redirect("/login?reset=1")
}

export async function resendVerificationAction(): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) return fail("Faça login novamente.")
  if (user.emailVerified) return ok(undefined, "Seu email já está verificado.")
  if (!(await rateLimit(`verify:${user.id}`, 3, 60 * 15))) return fail("Aguarde alguns minutos para reenviar.")
  await sendVerificationEmail(user)
  return ok(undefined, "Enviamos um novo link para seu email.")
}
