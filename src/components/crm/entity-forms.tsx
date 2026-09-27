"use client"

import { useState } from "react"
import { Field, fieldError } from "@/components/form"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import type { FormState } from "@/lib/action"
import { centsToInput } from "@/lib/format"
import { saveActivityAction } from "@/server/actions/activities"
import { saveCompanyAction, saveContactAction } from "@/server/actions/contacts"
import { saveDealAction } from "@/server/actions/deals"
import { activityTypeLabels } from "./badges"
import { FormDialog } from "./form-dialog"

export type Option = { id: string; label: string }

function SelectField({
  label,
  name,
  options,
  defaultValue,
  state,
  placeholder = "Nenhum",
  required,
}: {
  label: string
  name: string
  options: Option[]
  defaultValue?: string | null
  state: FormState
  placeholder?: string
  required?: boolean
}) {
  const error = fieldError(state, name)
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={`f-${name}`}>{label}</Label>
      <NativeSelect
        id={`f-${name}`}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={Boolean(error) || undefined}
      >
        {!required && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </NativeSelect>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}

const toDateInput = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "")
const toDateTimeInput = (d: Date | string | null | undefined) => {
  if (!d) return ""
  const date = new Date(d)
  const off = date.getTimezoneOffset()
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16)
}

/** datetime-local no fuso do navegador; envia ISO (UTC) num campo oculto. */
function DateTimeField({
  label,
  name,
  defaultValue,
  defaultToNextHour,
  error,
}: {
  label: string
  name: string
  defaultValue: Date | string | null | undefined
  defaultToNextHour?: boolean
  error?: string
}) {
  const [local, setLocal] = useState(() =>
    toDateTimeInput(defaultValue ?? (defaultToNextHour ? new Date(Date.now() + 60 * 60 * 1000) : null)),
  )
  const iso = local ? new Date(local).toISOString() : ""
  return (
    <Field label={label} name={`${name}Local`} error={error}>
      <input type="hidden" name={name} value={iso} />
      <input
        id={`f-${name}Local`}
        type="datetime-local"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        aria-invalid={Boolean(error) || undefined}
        className="h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
      />
    </Field>
  )
}

// ───────────────────────────── Deal ─────────────────────────────

export type DealFormValues = {
  id?: string
  title?: string
  valueCents?: number
  stageId?: string
  companyId?: string | null
  contactId?: string | null
  ownerId?: string | null
  expectedCloseDate?: Date | string | null
}

export type DealFormOptions = { stages: Option[]; companies: Option[]; contacts: Option[]; members: Option[] }

export function DealDialog({
  trigger,
  deal,
  options,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  deal?: DealFormValues
  options: DealFormOptions
  open?: boolean
  onOpenChange?: (o: boolean) => void
}) {
  const editing = Boolean(deal?.id)
  return (
    <FormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar negócio" : "Novo negócio"}
      description={editing ? undefined : "Registre uma nova oportunidade no pipeline."}
      action={saveDealAction}
      submitLabel={editing ? "Salvar alterações" : "Criar negócio"}
    >
      {(state) => (
        <>
          {deal?.id && <input type="hidden" name="id" value={deal.id} />}
          <Field
            label="Título"
            name="title"
            defaultValue={deal?.title}
            placeholder="Ex.: Licença anual — Acme"
            required
            autoFocus
            error={fieldError(state, "title")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Valor (R$)"
              name="value"
              inputMode="decimal"
              placeholder="0,00"
              defaultValue={deal?.valueCents ? centsToInput(deal.valueCents) : ""}
              error={fieldError(state, "value")}
              className="[&_input]:tabular"
            />
            <SelectField
              label="Estágio"
              name="stageId"
              options={options.stages}
              defaultValue={deal?.stageId ?? options.stages[0]?.id}
              state={state}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Empresa" name="companyId" options={options.companies} defaultValue={deal?.companyId} state={state} />
            <SelectField label="Contato" name="contactId" options={options.contacts} defaultValue={deal?.contactId} state={state} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Responsável"
              name="ownerId"
              options={options.members}
              defaultValue={deal?.ownerId}
              state={state}
              placeholder="Eu"
            />
            <Field
              label="Previsão de fechamento"
              name="expectedCloseDate"
              type="date"
              defaultValue={toDateInput(deal?.expectedCloseDate)}
              error={fieldError(state, "expectedCloseDate")}
            />
          </div>
        </>
      )}
    </FormDialog>
  )
}

// ───────────────────────────── Contact ─────────────────────────────

export type ContactFormValues = {
  id?: string
  firstName?: string
  lastName?: string | null
  email?: string | null
  phone?: string | null
  title?: string | null
  companyId?: string | null
}

export function ContactDialog({
  trigger,
  contact,
  companies,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  contact?: ContactFormValues
  companies: Option[]
  open?: boolean
  onOpenChange?: (o: boolean) => void
}) {
  const editing = Boolean(contact?.id)
  return (
    <FormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar contato" : "Novo contato"}
      action={saveContactAction}
      submitLabel={editing ? "Salvar alterações" : "Criar contato"}
    >
      {(state) => (
        <>
          {contact?.id && <input type="hidden" name="id" value={contact.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome"
              name="firstName"
              defaultValue={contact?.firstName}
              required
              autoFocus
              error={fieldError(state, "firstName")}
            />
            <Field label="Sobrenome" name="lastName" defaultValue={contact?.lastName ?? ""} error={fieldError(state, "lastName")} />
          </div>
          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={contact?.email ?? ""}
            placeholder="nome@empresa.com"
            error={fieldError(state, "email")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Telefone"
              name="phone"
              type="tel"
              defaultValue={contact?.phone ?? ""}
              placeholder="(11) 90000-0000"
              error={fieldError(state, "phone")}
            />
            <Field label="Cargo" name="title" defaultValue={contact?.title ?? ""} error={fieldError(state, "title")} />
          </div>
          <SelectField label="Empresa" name="companyId" options={companies} defaultValue={contact?.companyId} state={state} />
        </>
      )}
    </FormDialog>
  )
}

// ───────────────────────────── Company ─────────────────────────────

export type CompanyFormValues = {
  id?: string
  name?: string
  domain?: string | null
  industry?: string | null
  size?: string | null
}

const sizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]

export function CompanyDialog({
  trigger,
  company,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  company?: CompanyFormValues
  open?: boolean
  onOpenChange?: (o: boolean) => void
}) {
  const editing = Boolean(company?.id)
  return (
    <FormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar empresa" : "Nova empresa"}
      action={saveCompanyAction}
      submitLabel={editing ? "Salvar alterações" : "Criar empresa"}
    >
      {(state) => (
        <>
          {company?.id && <input type="hidden" name="id" value={company.id} />}
          <Field label="Nome" name="name" defaultValue={company?.name} required autoFocus error={fieldError(state, "name")} />
          <Field
            label="Site / domínio"
            name="domain"
            defaultValue={company?.domain ?? ""}
            placeholder="empresa.com.br"
            error={fieldError(state, "domain")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Setor"
              name="industry"
              defaultValue={company?.industry ?? ""}
              placeholder="Ex.: SaaS, Varejo"
              error={fieldError(state, "industry")}
            />
            <SelectField
              label="Funcionários"
              name="size"
              options={sizes.map((s) => ({ id: s, label: s }))}
              defaultValue={company?.size}
              state={state}
              placeholder="Não informado"
            />
          </div>
        </>
      )}
    </FormDialog>
  )
}

// ───────────────────────────── Activity ─────────────────────────────

export type ActivityFormValues = {
  id?: string
  type?: "task" | "call" | "meeting" | "email"
  title?: string
  description?: string | null
  dueAt?: Date | string | null
  dealId?: string | null
  contactId?: string | null
  companyId?: string | null
  assigneeId?: string | null
}

export function ActivityDialog({
  trigger,
  activity,
  members,
  deals,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  activity?: ActivityFormValues
  members: Option[]
  deals?: Option[]
  open?: boolean
  onOpenChange?: (o: boolean) => void
}) {
  const editing = Boolean(activity?.id)
  return (
    <FormDialog
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar atividade" : "Nova atividade"}
      action={saveActivityAction}
      submitLabel={editing ? "Salvar" : "Criar atividade"}
    >
      {(state) => (
        <>
          {activity?.id && <input type="hidden" name="id" value={activity.id} />}
          {!deals && activity?.dealId && <input type="hidden" name="dealId" value={activity.dealId} />}
          {activity?.contactId && <input type="hidden" name="contactId" value={activity.contactId} />}
          {activity?.companyId && <input type="hidden" name="companyId" value={activity.companyId} />}
          <div className="grid grid-cols-4 gap-1.5 rounded-lg bg-muted p-1">
            {(Object.keys(activityTypeLabels) as (keyof typeof activityTypeLabels)[]).map((t) => (
              <label
                key={t}
                className="cursor-pointer rounded-md py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-sm"
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  defaultChecked={(activity?.type ?? "task") === t}
                  className="sr-only"
                />
                {activityTypeLabels[t]}
              </label>
            ))}
          </div>
          <Field
            label="Título"
            name="title"
            defaultValue={activity?.title}
            placeholder="Ex.: Ligar para alinhar proposta"
            required
            autoFocus
            error={fieldError(state, "title")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <DateTimeField
              label="Vencimento"
              name="dueAt"
              defaultValue={activity?.dueAt}
              defaultToNextHour={!editing}
              error={fieldError(state, "dueAt")}
            />
            <SelectField
              label="Responsável"
              name="assigneeId"
              options={members}
              defaultValue={activity?.assigneeId}
              state={state}
              placeholder="Eu"
            />
          </div>
          {deals && (
            <SelectField label="Negócio" name="dealId" options={deals} defaultValue={activity?.dealId} state={state} />
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="f-description">Descrição</Label>
            <Textarea id="f-description" name="description" rows={3} defaultValue={activity?.description ?? ""} />
          </div>
        </>
      )}
    </FormDialog>
  )
}
