import "server-only"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"
import { consumeToken } from "./auth-tokens"
import { sendEmail } from "./email/send"
import { templates } from "./email/templates"

export type ConfirmResult =
  | { status: "verified" }
  | { status: "email_changed"; email: string }
  | { status: "email_taken" }
  | { status: "invalid" }

/** Consome token de verificação ou de troca de email (usado por /verify-email). */
export async function confirmEmailToken(token: string): Promise<ConfirmResult> {
  const row = await consumeToken(token, ["email_verify", "email_change"])
  if (!row) return { status: "invalid" }

  if (row.type === "email_verify") {
    await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, row.userId))
    return { status: "verified" }
  }

  const newEmail = row.payload?.newEmail
  if (!newEmail) return { status: "invalid" }
  const taken = await db.query.users.findFirst({ where: eq(users.email, newEmail), columns: { id: true } })
  if (taken) return { status: "email_taken" }

  const old = await db.query.users.findFirst({ where: eq(users.id, row.userId) })
  await db.update(users).set({ email: newEmail, emailVerified: new Date() }).where(eq(users.id, row.userId))
  if (old) await sendEmail({ to: old.email, ...templates.emailChangedNotice(newEmail) })
  return { status: "email_changed", email: newEmail }
}
