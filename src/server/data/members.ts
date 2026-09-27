import "server-only"
import { and, asc, desc, eq, gt, isNull } from "drizzle-orm"
import { db } from "@/db"
import { invitations, memberships, users } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export async function listMembers(ctx: OrgContext) {
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: memberships.role,
      joinedAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.orgId, ctx.org.id))
    .orderBy(asc(memberships.createdAt))
}

export type MemberRow = Awaited<ReturnType<typeof listMembers>>[number]

export async function listPendingInvites(ctx: OrgContext) {
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .where(
      and(eq(invitations.orgId, ctx.org.id), isNull(invitations.acceptedAt), gt(invitations.expiresAt, new Date())),
    )
    .orderBy(desc(invitations.createdAt))
}

export async function memberOptions(ctx: OrgContext) {
  const rows = await listMembers(ctx)
  return rows.map((m) => ({ id: m.userId, label: m.name ?? m.email, image: m.image }))
}
