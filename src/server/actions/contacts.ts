"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { db } from "@/db"
import { companies, contacts } from "@/db/schema"
import { fail, fromZod, ok, type ActionResult, type FormState } from "@/lib/action"
import { companySchema, contactSchema } from "@/lib/validations/crm"
import { requireOrgContext } from "@/server/context"
import { assertRefs } from "@/server/data/guards"
import { logActivity } from "@/server/data/timeline"
import { guarded } from "./safe"

export async function saveContactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return guarded(async () => {
    const ctx = await requireOrgContext()
    const parsed = contactSchema.safeParse(Object.fromEntries(formData))
    if (!parsed.success) return fromZod(parsed.error)
    await assertRefs(ctx, { companyId: parsed.data.companyId })
    const id = formData.get("id")?.toString() || null

    if (id) {
      const [row] = await db
        .update(contacts)
        .set(parsed.data)
        .where(and(eq(contacts.id, id), eq(contacts.orgId, ctx.org.id)))
        .returning({ id: contacts.id })
      if (!row) return fail("Contato não encontrado.")
      await logActivity(ctx, "contact", id, "updated")
      revalidatePath("/app/contacts")
      revalidatePath(`/app/contacts/${id}`)
      return ok({ id }, "Contato atualizado.")
    }
    const [created] = await db
      .insert(contacts)
      .values({ ...parsed.data, orgId: ctx.org.id, ownerId: ctx.user.id })
      .returning({ id: contacts.id })
    await logActivity(ctx, "contact", created.id, "created")
    revalidatePath("/app/contacts")
    return ok({ id: created.id }, "Contato criado.")
  })
}

export async function deleteContactAction(id: string, redirectTo?: string): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  await db.delete(contacts).where(and(eq(contacts.id, id), eq(contacts.orgId, ctx.org.id)))
  revalidatePath("/app/contacts")
  if (redirectTo) redirect(redirectTo)
  return ok(undefined, "Contato excluído.")
}

export async function saveCompanyAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ctx = await requireOrgContext()
  const parsed = companySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return fromZod(parsed.error)
  const id = formData.get("id")?.toString() || null
  const values = { ...parsed.data, domain: parsed.data.domain?.replace(/^https?:\/\//, "").replace(/\/$/, "") ?? null }

  if (id) {
    const [row] = await db
      .update(companies)
      .set(values)
      .where(and(eq(companies.id, id), eq(companies.orgId, ctx.org.id)))
      .returning({ id: companies.id })
    if (!row) return fail("Empresa não encontrada.")
    await logActivity(ctx, "company", id, "updated")
    revalidatePath("/app/companies")
    revalidatePath(`/app/companies/${id}`)
    return ok({ id }, "Empresa atualizada.")
  }
  const [created] = await db
    .insert(companies)
    .values({ ...values, orgId: ctx.org.id, ownerId: ctx.user.id })
    .returning({ id: companies.id })
  await logActivity(ctx, "company", created.id, "created")
  revalidatePath("/app/companies")
  return ok({ id: created.id }, "Empresa criada.")
}

export async function deleteCompanyAction(id: string, redirectTo?: string): Promise<ActionResult> {
  const ctx = await requireOrgContext()
  await db.delete(companies).where(and(eq(companies.id, id), eq(companies.orgId, ctx.org.id)))
  revalidatePath("/app/companies")
  if (redirectTo) redirect(redirectTo)
  return ok(undefined, "Empresa excluída.")
}
