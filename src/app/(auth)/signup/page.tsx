import type { Metadata } from "next"
import Link from "next/link"
import { oauthProviders } from "@/auth"
import { AuthHeader } from "@/components/auth/auth-header"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = { title: "Criar conta" }

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; email?: string }>
}) {
  const sp = await searchParams
  return (
    <>
      <AuthHeader
        title="Crie sua conta"
        description={
          <>
            Já tem conta?{" "}
            <Link
              href={sp.callbackUrl ? `/login?callbackUrl=${encodeURIComponent(sp.callbackUrl)}` : "/login"}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </>
        }
      />
      <OAuthButtons providers={oauthProviders} callbackUrl={sp.callbackUrl ?? "/onboarding"} />
      <SignupForm callbackUrl={sp.callbackUrl} email={sp.email} />
    </>
  )
}
