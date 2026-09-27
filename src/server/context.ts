import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { and, asc, eq } from "drizzle-orm"
import { auth } from "@/auth"
import { orgCookie } from "@/config/site"
import { db } from "@/db"
import { memberships, organizations, users, type Organization, type Role, type User } from "@/db/schema"
import { can, type Action } from "./permissions"

export type OrgContext = { user: User; org: Organization; role: Role }

export class ForbiddenError extends Error {
  constructor(message = "Você não tem permissão para esta ação.") {
    super(message)
  }
}

/** Usuário autenticado (fresco do banco) ou null. Memoizado por request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await auth()
  const id = session?.user?.id
  if (!id) return null
  return (await db.query.users.findFirst({ where: eq(users.id, id) })) ?? null
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return user
}

export const getUserOrgs = cache(async (userId: string) => {
  return db
    .select({ org: organizations, role: memberships.role })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(memberships.createdAt))
})

/** Resolve a organização ativa a partir do cookie, validando a membership. */
export const requireOrgContext = cache(async (): Promise<OrgContext> => {
  const user = await requireUser()
  const orgs = await getUserOrgs(user.id)
  if (orgs.length === 0) redirect("/onboarding")

  const store = await cookies()
  const wanted = store.get(orgCookie)?.value
  const active = orgs.find((o) => o.org.id === wanted) ?? orgs[0]
  return { user, org: active.org, role: active.role }
})

export function assertCan(ctx: OrgContext, action: Action) {
  if (!can(ctx.role, action)) throw new ForbiddenError()
}

export async function getMembership(userId: string, orgId: string) {
  return db.query.memberships.findFirst({
    where: and(eq(memberships.userId, userId), eq(memberships.orgId, orgId)),
  })
}
