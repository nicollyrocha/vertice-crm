import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthHeader } from "@/components/auth/auth-header"
import { ForgotPasswordForm } from "@/components/auth/password-reset-forms"

export const metadata: Metadata = { title: "Recuperar senha" }

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthHeader
        title="Esqueceu a senha?"
        description="Informe seu email e enviaremos um link para você criar uma nova senha."
      />
      <ForgotPasswordForm />
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para o login
      </Link>
    </>
  )
}
