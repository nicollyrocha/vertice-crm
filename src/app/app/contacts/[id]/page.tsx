import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Mail, Phone } from "lucide-react"
import { UserAvatar } from "@/components/app/user-avatar"
import { EntityActivities } from "@/components/crm/activity-list"
import { BackLink, DetailGrid, Panel, Properties, SectionTitle } from "@/components/crm/detail-layout"
import { ContactActions } from "@/components/crm/entity-actions"
import { NotesPanel } from "@/components/crm/notes-panel"
import { RelatedDeals } from "@/components/crm/related-deals"
import { Timeline } from "@/components/crm/timeline"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/format"
import { requireOrgContext } from "@/server/context"
import { listActivitiesFor } from "@/server/data/activities"
import { companyOptions } from "@/server/data/companies"
import { getContact } from "@/server/data/contacts"
import { listDealsFor } from "@/server/data/deals"
import { memberOptions } from "@/server/data/members"
import { listNotes } from "@/server/data/notes"
import { getTimeline } from "@/server/data/timeline"

export const metadata: Metadata = { title: "Contato" }

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireOrgContext()
  const contact = await getContact(ctx, id)
  if (!contact) notFound()

  const [companies, members, deals, activities, notes, timeline] = await Promise.all([
    companyOptions(ctx),
    memberOptions(ctx),
    listDealsFor(ctx, { contactId: id }),
    listActivitiesFor(ctx, { contactId: id }),
    listNotes(ctx, { contactId: id }),
    getTimeline(ctx, "contact", id),
  ])
  const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ")

  return (
    <div className="mx-auto max-w-[1400px]">
      <BackLink href="/app/contacts" label="Contatos" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <UserAvatar name={name} className="size-14 text-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{name}</h1>
            <p className="text-sm text-muted-foreground">
              {[contact.title, contact.companyName].filter(Boolean).join(" · ") || "Sem cargo definido"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {contact.email && (
            <Button asChild variant="outline">
              <a href={`mailto:${contact.email}`}>
                <Mail /> Email
              </a>
            </Button>
          )}
          {contact.phone && (
            <Button asChild variant="outline">
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
                <Phone /> Ligar
              </a>
            </Button>
          )}
          <ContactActions
            companies={companies}
            contact={{
              id: contact.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              title: contact.title,
              companyId: contact.companyId,
            }}
          />
        </div>
      </div>

      <DetailGrid
        main={
          <>
            <EntityActivities
              activities={activities}
              members={members.map((m) => ({ id: m.id, label: m.label }))}
              refs={{ contactId: id }}
            />
            <div>
              <SectionTitle>Notas</SectionTitle>
              <NotesPanel notes={notes} refs={{ contactId: id }} currentUserId={ctx.user.id} />
            </div>
          </>
        }
        aside={
          <>
            <Panel title="Informações">
              <Properties
                items={[
                  { label: "Email", value: contact.email },
                  { label: "Telefone", value: contact.phone },
                  { label: "Cargo", value: contact.title },
                  {
                    label: "Empresa",
                    value: contact.companyId ? (
                      <Link href={`/app/companies/${contact.companyId}`} className="hover:underline">
                        {contact.companyName}
                      </Link>
                    ) : null,
                  },
                  { label: "Criado em", value: formatDate(contact.createdAt) },
                ]}
              />
            </Panel>
            <Panel title={`Negócios (${deals.length})`}>
              <RelatedDeals deals={deals} />
            </Panel>
            <Panel title="Histórico">
              <Timeline items={timeline} />
            </Panel>
          </>
        }
      />
    </div>
  )
}
