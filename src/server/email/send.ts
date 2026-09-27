import "server-only"
import { Resend } from "resend"

type Email = { to: string; subject: string; html: string; text?: string }

let client: Resend | undefined

export async function sendEmail({ to, subject, html, text }: Email) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    // Sem Resend configurado (dev): loga para você copiar o link.
    console.info(`\n📧 [email:dev] Para: ${to}\nAssunto: ${subject}\n${text ?? html.replace(/<[^>]+>/g, " ")}\n`)
    return { ok: true as const }
  }
  client ??= new Resend(key)
  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM ?? "Vértice <onboarding@resend.dev>",
    to,
    subject,
    html,
    text,
  })
  if (error) {
    console.error("[email] falha ao enviar", error)
    return { ok: false as const, error: error.message }
  }
  return { ok: true as const }
}
