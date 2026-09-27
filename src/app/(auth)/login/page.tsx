import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, Info } from "lucide-react"
import { oauthProviders } from "@/auth"
import { AuthHeader } from "@/components/auth/auth-header"
import { LoginForm } from "@/components/auth/login-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"

export const metadata: Metadata = { title: "Entrar" }

const errors: Record<string, string> = {
  OAuthAccountNotLinked: "Este email já está vinculado a outro método de login. Entre com email e senha.",
  AccessDenied: "Acesso negado.",
  Configuration: "Erro de configuração de autenticação. Tente novamente mais tarde.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; reset?: string; demo?: string; error?: string }>
}) {
  const sp = await searchParams
  const demo = sp.demo === "1"
  return (
    <>
      <AuthHeader
        title="Bem-vindo de volta"
        description={
          <>
            Não tem conta?{" "}
            <Link
              href={sp.callbackUrl ? `/signup?callbackUrl=${encodeURIComponent(sp.callbackUrl)}` : "/signup"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Crie grátis
            </Link>
          </>
        }
      />
      {sp.reset && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
          <CheckCircle2 className="size-4" /> Senha redefinida. Entre com a nova senha.
        </div>
      )}
      {sp.error && (
        <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          {errors[sp.error] ?? "Não foi possível entrar. Tente novamente."}
        </div>
      )}
      {demo && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border bg-brand-soft/60 px-3 py-2.5 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>Conta de demonstração preenchida. Rode <code className="font-mono text-xs">npm run db:seed</code> antes, se ainda não rodou.</span>
        </div>
      )}
      <OAuthButtons providers={oauthProviders} callbackUrl={sp.callbackUrl} />
      <LoginForm
        callbackUrl={sp.callbackUrl}
        defaults={demo ? { email: "demo@vertice.app", password: "demo12345" } : undefined}
      />
    </>
  )
}
