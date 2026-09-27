import "server-only"
import { and, desc, eq } from "drizzle-orm"
import { db } from "@/db"
import { activityLog, users, type EntityType } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export async function logActivity(
  ctx: OrgContext,
  entityType: EntityType,
  entityId: string,
  action: string,
  meta?: Record<string, unknown>,
) {
  await db.insert(activityLog).values({ orgId: ctx.org.id, actorId: ctx.user.id, entityType, entityId, action, meta })
}

export async function getTimeline(ctx: OrgContext, entityType: EntityType, entityId: string, limit = 30) {
  return db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      meta: activityLog.meta,
      createdAt: activityLog.createdAt,
      actorName: users.name,
      actorImage: users.image,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.actorId, users.id))
    .where(
      and(eq(activityLog.orgId, ctx.org.id), eq(activityLog.entityType, entityType), eq(activityLog.entityId, entityId)),
    )
    .orderBy(desc(activityLog.createdAt))
    .limit(limit)
}

export type TimelineItem = Awaited<ReturnType<typeof getTimeline>>[number]
