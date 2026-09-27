import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, MailCheck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { confirmEmailToken } from "@/server/email-confirm"

export const metadata: Metadata = { title: "Confirmação de email" }

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  const result = token ? await confirmEmailToken(token) : { status: "invalid" as const }

  const view = {
    verified: {
      icon: CheckCircle2,
      tone: "text-success bg-success/10",
      title: "Email confirmado!",
      body: "Sua conta está verificada. Tudo pronto para vender.",
    },
    email_changed: {
      icon: MailCheck,
      tone: "text-success bg-success/10",
      title: "Email atualizado",
      body: `Agora você entra com ${"email" in result ? result.email : "seu novo email"}.`,
    },
    email_taken: {
      icon: XCircle,
      tone: "text-destructive bg-destructive/10",
      title: "Email já em uso",
      body: "Outra conta passou a usar este email. Tente outro endereço nas configurações do perfil.",
    },
    invalid: {
      icon: XCircle,
      tone: "text-destructive bg-destructive/10",
      title: "Link inválido ou expirado",
      body: "Solicite um novo link de confirmação a partir do app.",
    },
  }[result.status]

  return (
    <div className="text-center">
      <div className={`mx-auto grid size-14 place-items-center rounded-2xl ${view.tone}`}>
        <view.icon className="size-7" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{view.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{view.body}</p>
      <Button asChild size="lg" className="mt-8 h-10 w-full">
        <Link href="/app">Ir para o app</Link>
      </Button>
    </div>
  )
}
