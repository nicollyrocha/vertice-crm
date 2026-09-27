"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { and, eq, isNull } from "drizzle-orm"
import { orgCookie } from "@/config/site"
import { appUrl } from "@/env"
import { db } from "@/db"
import { invitations, memberships, organizations, type Role } from "@/db/schema"
import { fail, fromZod, ok, type FormState } from "@/lib/action"
import { addMinutes, createToken, hashToken } from "@/lib/tokens"
import { inviteSchema, orgSchema } from "@/lib/validations/crm"
import { assertCan, getMembership, getUserOrgs, requireOrgContext, requireUser } from "@/server/context"
import { sendEmail } from "@/server/email/send"
import { templates } from "@/server/email/templates"
import { createOrganization } from "@/server/org-setup"
import { canChangeRole, canRemoveMember } from "@/server/permissions"
import { rateLimit } from "@/server/rate-limit"
import { deleteImage, uploadImage } from "@/server/upload"

const cookieOpts = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 365 }

async function setActiveOrg(orgId: string) {
  const store = await cookies()
  store.set(orgCookie, orgId, { ...cookieOpts, secure: process.env.NODE_ENV === "production" })
}

export async function createOrgAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser()
  const parsed = orgSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  if (!(await rateLimit(`org-create:${user.id}`, 10, 60 * 60))) return fail("Limite de criação atingido. Tente mais tarde.")

  const { orgId } = await createOrganization(parsed.data.name, user.id)
  await setActiveOrg(orgId)
  redirect("/app")
}

export async function switchOrgAction(orgId: string) {
  const user = await requireUser()
  const orgs = await getUserOrgs(user.id)
  if (!orgs.some((o) => o.org.id === orgId)) return fail("Organização não encontrada.")
  await setActiveOrg(orgId)
  redirect("/app")
}

export async function updateOrgAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireOrgContext()
  assertCan(ctx, "org:update")
  const parsed = orgSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  await db.update(organizations).set({ name: parsed.data.name }).where(eq(organizations.id, ctx.org.id))
  revalidatePath("/app", "layout")
  return ok(undefined, "Organização atualizada.")
}

export async function uploadOrgLogoAction(formData: FormData): Promise<FormState> {
  const ctx = await requireOrgContext()
  assertCan(ctx, "org:update")
  const result = await uploadImage(formData.get("file"), `orgs/${ctx.org.id}`)
  if (!result.ok) return fail(result.error)
  await db.update(organizations).set({ logoUrl: result.url }).where(eq(organizations.id, ctx.org.id))
  await deleteImage(ctx.org.logoUrl)
  revalidatePath("/app", "layout")
  return ok(undefined, "Logo atualizado.")
}

export async function deleteOrgAction(): Promise<FormState> {
  const ctx = await requireOrgContext()
  assertCan(ctx, "org:delete")
  await db.delete(organizations).where(eq(organizations.id, ctx.org.id))
  const store = await cookies()
  store.delete(orgCookie)
  redirect("/app")
}

export async function inviteMemberAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireOrgContext()
  assertCan(ctx, "members:invite")
  const parsed = inviteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  const { email, role } = parsed.data

  if (!(await rateLimit(`invite:${ctx.org.id}`, 30, 60 * 60))) return fail("Limite de convites atingido. Tente mais tarde.")

  const alreadyMember = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
    with: { memberships: { where: (m, { eq }) => eq(m.orgId, ctx.org.id) } },
  })
  if (alreadyMember?.memberships.length) return fail("Esta pessoa já faz parte da organização.")

  const { token, hash } = createToken()
  await db.batch([
    db
      .delete(invitations)
      .where(and(eq(invitations.orgId, ctx.org.id), eq(invitations.email, email), isNull(invitations.acceptedAt))),
    db.insert(invitations).values({
      orgId: ctx.org.id,
      email,
      role,
      tokenHash: hash,
      invitedBy: ctx.user.id,
      expiresAt: addMinutes(new Date(), 60 * 24 * 7),
    }),
  ])
  await sendEmail({
    to: email,
    ...templates.invitation(ctx.org.name, ctx.user.name ?? ctx.user.email, `${appUrl()}/invite/${token}`),
  })
  revalidatePath("/app/settings/members")
  return ok(undefined, `Convite enviado para ${email}.`)
}

export async function revokeInviteAction(inviteId: string): Promise<FormState> {
  const ctx = await requireOrgContext()
  assertCan(ctx, "members:invite")
  await db.delete(invitations).where(and(eq(invitations.id, inviteId), eq(invitations.orgId, ctx.org.id)))
  revalidatePath("/app/settings/members")
  return ok(undefined, "Convite cancelado.")
}

export async function changeRoleAction(userId: string, next: Role): Promise<FormState> {
  const ctx = await requireOrgContext()
  if (userId === ctx.user.id) return fail("Você não pode alterar seu próprio papel.")
  const target = await getMembership(userId, ctx.org.id)
  if (!target) return fail("Membro não encontrado.")
  if (!canChangeRole(ctx.role, target.role, next)) return fail("Você não tem permissão para esta alteração.")

  if (next === "owner") {
    // Transferência de propriedade: quem transfere vira admin.
    await db.batch([
      db
        .update(memberships)
        .set({ role: "owner" })
        .where(and(eq(memberships.userId, userId), eq(memberships.orgId, ctx.org.id))),
      db
        .update(memberships)
        .set({ role: "admin" })
        .where(and(eq(memberships.userId, ctx.user.id), eq(memberships.orgId, ctx.org.id))),
    ])
  } else {
    await db
      .update(memberships)
      .set({ role: next })
      .where(and(eq(memberships.userId, userId), eq(memberships.orgId, ctx.org.id)))
  }
  revalidatePath("/app/settings/members")
  return ok(undefined, "Papel atualizado.")
}

export async function removeMemberAction(userId: string): Promise<FormState> {
  const ctx = await requireOrgContext()
  if (userId === ctx.user.id) return fail("Use a opção 'Sair da organização'.")
  const target = await getMembership(userId, ctx.org.id)
  if (!target) return fail("Membro não encontrado.")
  if (!canRemoveMember(ctx.role, target.role)) return fail("Você não tem permissão para remover este membro.")
  await db.delete(memberships).where(and(eq(memberships.userId, userId), eq(memberships.orgId, ctx.org.id)))
  revalidatePath("/app/settings/members")
  return ok(undefined, "Membro removido.")
}

export async function leaveOrgAction(): Promise<FormState> {
  const ctx = await requireOrgContext()
  if (ctx.role === "owner") return fail("Transfira a propriedade antes de sair da organização.")
  await db.delete(memberships).where(and(eq(memberships.userId, ctx.user.id), eq(memberships.orgId, ctx.org.id)))
  const store = await cookies()
  store.delete(orgCookie)
  redirect("/app")
}

export async function acceptInviteAction(token: string): Promise<FormState> {
  const user = await requireUser()
  const invite = await db.query.invitations.findFirst({ where: eq(invitations.tokenHash, hashToken(token)) })
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) return fail("Convite inválido ou expirado.")
  if (invite.email !== user.email) {
    return fail(`Este convite foi enviado para ${invite.email}. Entre com essa conta para aceitar.`)
  }

  const existing = await getMembership(user.id, invite.orgId)
  await db.batch([
    db.update(invitations).set({ acceptedAt: new Date() }).where(eq(invitations.id, invite.id)),
    ...(existing ? [] : [db.insert(memberships).values({ userId: user.id, orgId: invite.orgId, role: invite.role })]),
  ])
  await setActiveOrg(invite.orgId)
  redirect("/app")
}
