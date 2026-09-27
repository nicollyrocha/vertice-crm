import type { Metadata } from "next"
import Link from "next/link"
import { AuthHeader } from "@/components/auth/auth-header"
import { ResetPasswordForm } from "@/components/auth/password-reset-forms"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Redefinir senha" }

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  if (!token) {
    return (
      <>
        <AuthHeader title="Link inválido" description="Este link de redefinição está incompleto ou expirou." />
        <Button asChild size="lg" className="h-10 w-full">
          <Link href="/forgot-password">Solicitar novo link</Link>
        </Button>
      </>
    )
  }
  return (
    <>
      <AuthHeader title="Crie uma nova senha" description="Escolha uma senha forte que você não use em outros sites." />
      <ResetPasswordForm token={token} />
    </>
  )
}
