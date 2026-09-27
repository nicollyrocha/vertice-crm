import "server-only"
import { and, desc, eq, type SQL } from "drizzle-orm"
import { db } from "@/db"
import { notes, users } from "@/db/schema"
import type { OrgContext } from "@/server/context"

export async function listNotes(ctx: OrgContext, by: { dealId?: string; contactId?: string; companyId?: string }) {
  const where: SQL[] = [eq(notes.orgId, ctx.org.id)]
  if (by.dealId) where.push(eq(notes.dealId, by.dealId))
  if (by.contactId) where.push(eq(notes.contactId, by.contactId))
  if (by.companyId) where.push(eq(notes.companyId, by.companyId))
  return db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      authorId: notes.authorId,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(notes)
    .leftJoin(users, eq(notes.authorId, users.id))
    .where(and(...where))
    .orderBy(desc(notes.createdAt))
}

export type NoteRow = Awaited<ReturnType<typeof listNotes>>[number]
