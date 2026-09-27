import type { Metadata } from "next"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { Users } from "lucide-react"
import { AcceptInviteButton } from "@/components/auth/accept-invite-button"
import { Button } from "@/components/ui/button"
import { db } from "@/db"
import { invitations, organizations } from "@/db/schema"
import { hashToken } from "@/lib/tokens"
import { getCurrentUser } from "@/server/context"
import { roleLabels } from "@/server/permissions"

export const metadata: Metadata = { title: "Convite" }

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const [row] = await db
    .select({ invite: invitations, orgName: organizations.name })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.orgId, organizations.id))
    .where(eq(invitations.tokenHash, hashToken(token)))
    .limit(1)

  const valid = row && !row.invite.acceptedAt && row.invite.expiresAt > new Date()
  if (!valid) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Convite indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este convite expirou ou já foi usado. Peça um novo convite ao administrador.
        </p>
        <Button asChild size="lg" variant="outline" className="mt-8 h-10 w-full">
          <Link href="/">Voltar ao início</Link>
        </Button>
      </div>
    )
  }

  const user = await getCurrentUser()
  const callback = `/invite/${token}`
  return (
    <div className="text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand">
        <Users className="size-7" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Junte-se a {row.orgName}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Você foi convidado como <b className="text-foreground">{roleLabels[row.invite.role]}</b> para{" "}
        <b className="text-foreground">{row.invite.email}</b>.
      </p>
      <div className="mt-8 grid gap-2">
        {user ? (
          <>
            <AcceptInviteButton token={token} />
            {user.email !== row.invite.email && (
              <p className="text-xs text-muted-foreground">
                Você está logado como {user.email}. Entre com {row.invite.email} para aceitar.
              </p>
            )}
          </>
        ) : (
          <>
            <Button asChild size="lg" className="h-10">
              <Link
                href={`/signup?callbackUrl=${encodeURIComponent(callback)}&email=${encodeURIComponent(row.invite.email)}`}
              >
                Criar conta e aceitar
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-10">
              <Link href={`/login?callbackUrl=${encodeURIComponent(callback)}`}>Já tenho conta</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
