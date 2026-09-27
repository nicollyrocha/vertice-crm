import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Globe } from "lucide-react"
import { EntityAvatar, UserAvatar } from "@/components/app/user-avatar"
import { EntityActivities } from "@/components/crm/activity-list"
import { BackLink, DetailGrid, Panel, Properties, SectionTitle } from "@/components/crm/detail-layout"
import { CompanyActions } from "@/components/crm/entity-actions"
import { NotesPanel } from "@/components/crm/notes-panel"
import { RelatedDeals } from "@/components/crm/related-deals"
import { Timeline } from "@/components/crm/timeline"
import { Button } from "@/components/ui/button"
import { formatCompactBRL, formatDate } from "@/lib/format"
import { requireOrgContext } from "@/server/context"
import { listActivitiesFor } from "@/server/data/activities"
import { getCompany } from "@/server/data/companies"
import { listContacts } from "@/server/data/contacts"
import { listDealsFor } from "@/server/data/deals"
import { memberOptions } from "@/server/data/members"
import { listNotes } from "@/server/data/notes"
import { getTimeline } from "@/server/data/timeline"

export const metadata: Metadata = { title: "Empresa" }

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireOrgContext()
  const company = await getCompany(ctx, id)
  if (!company) notFound()

  const [members, contacts, deals, activities, notes, timeline] = await Promise.all([
    memberOptions(ctx),
    listContacts(ctx, { companyId: id }),
    listDealsFor(ctx, { companyId: id }),
    listActivitiesFor(ctx, { companyId: id }),
    listNotes(ctx, { companyId: id }),
    getTimeline(ctx, "company", id),
  ])
  const openValue = deals.filter((d) => d.status === "open").reduce((s, d) => s + d.valueCents, 0)

  return (
    <div className="mx-auto max-w-[1400px]">
      <BackLink href="/app/companies" label="Empresas" />
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <EntityAvatar name={company.name} className="size-14 rounded-xl text-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">{company.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[company.industry, company.size && `${company.size} funcionários`].filter(Boolean).join(" · ") || "Sem setor definido"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {company.domain && (
            <Button asChild variant="outline">
              <a href={`https://${company.domain}`} target="_blank" rel="noopener noreferrer">
                <Globe /> Site
              </a>
            </Button>
          )}
          <CompanyActions
            company={{ id: company.id, name: company.name, domain: company.domain, industry: company.industry, size: company.size }}
          />
        </div>
      </div>

      <dl className="mb-6 grid grid-cols-3 divide-x rounded-2xl border bg-card">
        {[
          ["Pipeline aberto", formatCompactBRL(openValue)],
          ["Negócios", String(deals.length)],
          ["Contatos", String(contacts.total)],
        ].map(([l, v]) => (
          <div key={l} className="p-4">
            <dt className="text-xs text-muted-foreground">{l}</dt>
            <dd className="mt-1 text-xl font-semibold tabular tracking-tight">{v}</dd>
          </div>
        ))}
      </dl>

      <DetailGrid
        main={
          <>
            <section className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <h2 className="text-sm font-medium">Contatos ({contacts.total})</h2>
              </div>
              {contacts.rows.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Nenhum contato nesta empresa.</p>
              ) : (
                <ul className="divide-y">
                  {contacts.rows.map((c) => {
                    const n = [c.firstName, c.lastName].filter(Boolean).join(" ")
                    return (
                      <li key={c.id}>
                        <Link href={`/app/contacts/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
                          <UserAvatar name={n} />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{n}</div>
                            <div className="truncate text-xs text-muted-foreground">{c.title ?? c.email}</div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
            <EntityActivities
              activities={activities}
              members={members.map((m) => ({ id: m.id, label: m.label }))}
              refs={{ companyId: id }}
            />
            <div>
              <SectionTitle>Notas</SectionTitle>
              <NotesPanel notes={notes} refs={{ companyId: id }} currentUserId={ctx.user.id} />
            </div>
          </>
        }
        aside={
          <>
            <Panel title="Informações">
              <Properties
                items={[
                  { label: "Domínio", value: company.domain },
                  { label: "Setor", value: company.industry },
                  { label: "Funcionários", value: company.size },
                  { label: "Criado em", value: formatDate(company.createdAt) },
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
