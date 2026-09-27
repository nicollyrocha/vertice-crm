import type { Metadata } from "next"
import { InviteButton, InvitesList, MembersList } from "@/components/settings/members"
import { SettingsSection } from "@/components/settings/section"
import { requireOrgContext } from "@/server/context"
import { listMembers, listPendingInvites } from "@/server/data/members"
import { can } from "@/server/permissions"

export const metadata: Metadata = { title: "Membros" }

export default async function MembersSettingsPage() {
  const ctx = await requireOrgContext()
  const canInvite = can(ctx.role, "members:invite")
  const [members, invites] = await Promise.all([listMembers(ctx), canInvite ? listPendingInvites(ctx) : Promise.resolve([])])
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {members.length} membro{members.length === 1 ? "" : "s"} em <b className="text-foreground">{ctx.org.name}</b>
        </p>
        {canInvite && <InviteButton />}
      </div>
      <SettingsSection
        title="Membros"
        description="Proprietários e administradores gerenciam time, pipeline e organização. Membros usam o CRM."
      >
        <MembersList
          members={members}
          me={ctx.user.id}
          myRole={ctx.role}
        />
      </SettingsSection>
      {canInvite && (
        <SettingsSection title="Convites pendentes" description="Convites expiram em 7 dias.">
          <InvitesList invites={invites} canManage={canInvite} />
        </SettingsSection>
      )}
    </>
  )
}
