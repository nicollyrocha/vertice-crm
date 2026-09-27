"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { activities, notes } from "@/db/schema"
import { fail, fromZod, ok, type ActionResult, type FormState } from "@/lib/action"
import { activitySchema, noteSchema } from "@/lib/validations/crm"
import { requireOrgContext } from "@/server/context"
import { assertRefs } from "@/server/data/guards"
import { logActivity } from "@/server/data/timeline"
import { guarded } from "./safe"

function revalidateEntity(refs: { dealId?: string | null; contactId?: string | null; companyId?: string | null }) {
  revalidatePath("/app")
  revalidatePath("/app/activities")
  if (refs.dealId) revalidatePath(`/app/deals/${refs.dealId}`)
  if (refs.contactId) revalidatePath(`/app/contacts/${refs.contactId}`)
  if (refs.companyId) revalidatePath(`/app/companies/${refs.companyId}`)
}

export async function saveActivityAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    const parsed = activitySchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fromZod(parsed.error)
    const d = parsed.data
    await assertRefs(ctx, { dealId: d.dealId, contactId: d.contactId, companyId: d.companyId, userId: d.assigneeId })
    const id = formData.get("id")?.toString() || null
    const values = { ...d, assigneeId: d.assigneeId ?? ctx.user.id }

    if (id) {
      const [row] = await db
        .update(activities)
        .set(values)
        .where(and(eq(activities.id, id), eq(activities.orgId, ctx.org.id)))
        .returning({ id: activities.id })
      if (!row) return fail("Atividade não encontrada.")
    } else {
      await db.insert(activities).values({ ...values, orgId: ctx.org.id })
      if (d.dealId) await logActivity(ctx, "deal", d.dealId, "activity_added", { title: d.title })
    }
    revalidateEntity(d)
    return ok(undefined, id ? "Atividade atualizada." : "Atividade criada.")
  })
}

export async function toggleActivityAction(id: string, done: boolean): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  const [row] = await db
    .update(activities)
    .set({ completedAt: done ? new Date() : null })
    .where(and(eq(activities.id, id), eq(activities.orgId, ctx.org.id)))
    .returning()
  if (!row) return fail("Atividade não encontrada.")
  revalidateEntity(row)
  return ok(undefined, done ? "Atividade concluída." : "Atividade reaberta.")
}

export async function deleteActivityAction(id: string): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  const [row] = await db
    .delete(activities)
    .where(and(eq(activities.id, id), eq(activities.orgId, ctx.org.id)))
    .returning()
  if (row) revalidateEntity(row)
  return ok(undefined, "Atividade excluída.")
}

export async function createNoteAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    const parsed = noteSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fromZod(parsed.error)
    const d = parsed.data
    if (!d.dealId && !d.contactId && !d.companyId) return fail("Nota sem vínculo.")
    await assertRefs(ctx, d)
    await db.insert(notes).values({ ...d, orgId: ctx.org.id, authorId: ctx.user.id })
    revalidateEntity(d)
    return ok(undefined, "Nota adicionada.")
  })
}

export async function deleteNoteAction(id: string): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  const note = await db.query.notes.findFirst({ where: and(eq(notes.id, id), eq(notes.orgId, ctx.org.id)) })
  if (!note) return fail("Nota não encontrada.")
  if (note.authorId !== ctx.user.id && ctx.role === "member") return fail("Só o autor pode excluir esta nota.")
  await db.delete(notes).where(eq(notes.id, id))
  revalidateEntity(note)
  return ok(undefined, "Nota excluída.")
}
