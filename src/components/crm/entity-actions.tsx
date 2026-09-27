"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteCompanyAction, deleteContactAction } from "@/server/actions/contacts"
import { ConfirmAction } from "./confirm-button"
import {
  CompanyDialog,
  ContactDialog,
  type CompanyFormValues,
  type ContactFormValues,
  type Option,
} from "./entity-forms"

export function ContactActions({ contact, companies }: { contact: ContactFormValues & { id: string }; companies: Option[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil /> Editar
      </Button>
      <ConfirmAction
        title="Excluir contato?"
        description="O contato e suas notas e atividades serão removidos. Negócios vinculados serão mantidos."
        onConfirm={() => deleteContactAction(contact.id, "/app/contacts")}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Excluir contato">
            <Trash2 />
          </Button>
        }
      />
      <ContactDialog open={open} onOpenChange={setOpen} contact={contact} companies={companies} />
    </div>
  )
}

export function CompanyActions({ company }: { company: CompanyFormValues & { id: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil /> Editar
      </Button>
      <ConfirmAction
        title="Excluir empresa?"
        description="A empresa será removida. Contatos e negócios vinculados serão mantidos, sem empresa."
        onConfirm={() => deleteCompanyAction(company.id, "/app/companies")}
        trigger={
          <Button variant="ghost" size="icon" aria-label="Excluir empresa">
            <Trash2 />
          </Button>
        }
      />
      <CompanyDialog open={open} onOpenChange={setOpen} company={company} />
    </div>
  )
}
