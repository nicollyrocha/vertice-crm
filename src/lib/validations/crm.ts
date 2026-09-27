import { z } from "zod"
import { parseBRLToCents } from "@/lib/format"
import { email, optionalId, optionalText } from "./shared"

export const orgSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome da empresa").max(80),
})

export const inviteSchema = z.object({
  email,
  role: z.enum(["admin", "member"]).default("member"),
})

export const companySchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(120),
  domain: optionalText(120),
  industry: optionalText(80),
  size: optionalText(40),
})

export const contactSchema = z.object({
  firstName: z.string().trim().min(1, "Informe o nome").max(80),
  lastName: optionalText(80),
  email: z
    .union([email, z.literal("")])
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  phone: optionalText(40),
  title: optionalText(80),
  companyId: optionalId,
})

const optionalDate = z
  .string()
  .optional()
  .nullable()
  .transform((v, ctx) => {
    if (!v) return null
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Data inválida" })
      return z.NEVER
    }
    return d
  })

export const dealSchema = z
  .object({
    title: z.string().trim().min(1, "Informe o título").max(160),
    value: z.string().optional().default(""),
    stageId: z.string().min(1, "Escolha um estágio"),
    contactId: optionalId,
    companyId: optionalId,
    ownerId: optionalId,
    expectedCloseDate: optionalDate,
  })
  .transform((d, ctx) => {
    const valueCents = parseBRLToCents(d.value)
    if (Number.isNaN(valueCents)) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "Valor inválido" })
      return z.NEVER
    }
    const { value: _value, ...rest } = d
    return { ...rest, valueCents }
  })

export const activitySchema = z.object({
  type: z.enum(["task", "call", "meeting", "email"]).default("task"),
  title: z.string().trim().min(1, "Informe o título").max(160),
  description: optionalText(2000),
  dueAt: optionalDate,
  dealId: optionalId,
  contactId: optionalId,
  companyId: optionalId,
  assigneeId: optionalId,
})

export const noteSchema = z.object({
  body: z.string().trim().min(1, "Escreva algo").max(5000),
  dealId: optionalId,
  contactId: optionalId,
  companyId: optionalId,
})

export const stageSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome").max(40),
  probability: z.coerce.number().int().min(0).max(100),
  color: z.string().default("violet"),
})
