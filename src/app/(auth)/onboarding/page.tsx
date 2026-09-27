import type { Metadata } from "next"
import Link from "next/link"
import { AuthHeader } from "@/components/auth/auth-header"
import { OnboardingForm } from "@/components/auth/onboarding-form"
import { getUserOrgs, requireUser } from "@/server/context"

export const metadata: Metadata = { title: "Criar workspace" }

export default async function OnboardingPage() {
  const user = await requireUser()
  const orgs = await getUserOrgs(user.id)
  const first = user.name?.split(" ")[0]
  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand">Passo 1 de 1</span>
        Configuração do workspace
      </div>
      <AuthHeader
        title={orgs.length ? "Nova organização" : `Olá${first ? `, ${first}` : ""}! Vamos começar.`}
        description="Dê um nome ao workspace da sua empresa. Criaremos um pipeline de vendas pronto para usar."
      />
      <OnboardingForm />
      {orgs.length > 0 && (
        <Link href="/app" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
          Cancelar e voltar ao app
        </Link>
      )}
    </>
  )
}
