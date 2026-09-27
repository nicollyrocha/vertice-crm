import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { UserAvatar } from "@/components/app/user-avatar"
import { EntityActivities } from "@/components/crm/activity-list"
import { DealStatusBadge, StageBadge } from "@/components/crm/badges"
import { DealActions } from "@/components/crm/deal-actions"
import { BackLink, DetailGrid, Panel, Properties, SectionTitle } from "@/components/crm/detail-layout"
import { NotesPanel } from "@/components/crm/notes-panel"
import { Timeline } from "@/components/crm/timeline"
import { formatBRL, formatDate } from "@/lib/format"
import { requireOrgContext } from "@/server/context"
import { listActivitiesFor } from "@/server/data/activities"
import { getDeal } from "@/server/data/deals"
import { listNotes } from "@/server/data/notes"
import { dealFormOptions } from "@/server/data/options"
import { getTimeline } from "@/server/data/timeline"

export const metadata: Metadata = { title: "Negócio" }

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await requireOrgContext()
  const deal = await getDeal(ctx, id)
  if (!deal) notFound()

  const [{ pipeline, options }, activities, notes, timeline] = await Promise.all([
    dealFormOptions(ctx),
    listActivitiesFor(ctx, { dealId: id }),
    listNotes(ctx, { dealId: id }),
    getTimeline(ctx, "deal", id),
  ])
  const stageIndex = pipeline.stages.findIndex((s) => s.id === deal.stageId)
  const probability = pipeline.stages[stageIndex]?.probability ?? 0

  return (
    <div className="mx-auto max-w-[1400px]">
      <BackLink href="/app/deals" label="Negócios" />
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {deal.status === "open" ? (
              <StageBadge name={deal.stageName} color={deal.stageColor} />
            ) : (
              <DealStatusBadge status={deal.status} />
            )}
            {deal.companyName && <span className="text-sm text-muted-foreground">{deal.companyName}</span>}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{deal.title}</h1>
          <div className="mt-1 text-2xl font-semibold tabular text-muted-foreground">{formatBRL(deal.valueCents)}</div>
        </div>
        <DealActions
          status={deal.status}
          options={options}
          deal={{
            id: deal.id,
            title: deal.title,
            valueCents: deal.valueCents,
            stageId: deal.stageId,
            companyId: deal.companyId,
            contactId: deal.contactId,
            ownerId: deal.ownerId,
            expectedCloseDate: deal.expectedCloseDate,
          }}
        />
      </div>

      {/* Progresso no pipeline */}
      <div className="mb-8 flex gap-1" aria-label="Progresso no pipeline">
        {pipeline.stages.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div
              className={`h-1.5 rounded-full ${
                deal.status === "lost" ? "bg-muted" : i <= stageIndex ? "bg-brand" : "bg-muted"
              }`}
            />
            <div
              className={`mt-1.5 hidden truncate text-[11px] sm:block ${i === stageIndex ? "font-medium text-foreground" : "text-muted-foreground"}`}
            >
              {s.name}
            </div>
          </div>
        ))}
      </div>

      <DetailGrid
        main={
          <>
            <EntityActivities activities={activities} members={options.members} refs={{ dealId: id }} />
            <div>
              <SectionTitle>Notas</SectionTitle>
              <NotesPanel notes={notes} refs={{ dealId: id }} currentUserId={ctx.user.id} />
            </div>
          </>
        }
        aside={
          <>
            <Panel title="Detalhes">
              <Properties
                items={[
                  { label: "Valor", value: <span className="font-medium tabular">{formatBRL(deal.valueCents)}</span> },
                  { label: "Probabilidade", value: `${probability}%` },
                  { label: "Previsão", value: deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : null },
                  {
                    label: "Empresa",
                    value: deal.companyId ? (
                      <Link href={`/app/companies/${deal.companyId}`} className="hover:underline">
                        {deal.companyName}
                      </Link>
                    ) : null,
                  },
                  {
                    label: "Contato",
                    value: deal.contactId ? (
                      <Link href={`/app/contacts/${deal.contactId}`} className="hover:underline">
                        {deal.contactName}
                      </Link>
                    ) : null,
                  },
                  {
                    label: "Responsável",
                    value: deal.ownerName ? (
                      <span className="flex items-center gap-2">
                        <UserAvatar name={deal.ownerName} image={deal.ownerImage} className="size-5" />
                        {deal.ownerName}
                      </span>
                    ) : null,
                  },
                  { label: "Criado em", value: formatDate(deal.createdAt) },
                ]}
              />
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
