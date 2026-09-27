import type { Metadata } from "next"
import { OrgDanger, OrgGeneral } from "@/components/settings/org-forms"
import { requireOrgContext } from "@/server/context"
import { can } from "@/server/permissions"

export const metadata: Metadata = { title: "Organização" }

export default async function OrganizationSettingsPage() {
  const ctx = await requireOrgContext()
  return (
    <>
      <OrgGeneral org={ctx.org} canEdit={can(ctx.role, "org:update")} />
      <OrgDanger role={ctx.role} orgName={ctx.org.name} />
    </>
  )
}
