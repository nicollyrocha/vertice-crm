import type { Metadata } from "next"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { EmptyState, PageHeader } from "@/components/app/page-header"
import { EntityAvatar } from "@/components/app/user-avatar"
import { NewCompanyButton } from "@/components/crm/create-button"
import { Pagination } from "@/components/crm/pagination"
import { SearchInput } from "@/components/crm/search-input"
import { formatCompactBRL } from "@/lib/format"
import { requireOrgContext } from "@/server/context"
import { listCompanies } from "@/server/data/companies"

export const metadata: Metadata = { title: "Empresas" }

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams
  const ctx = await requireOrgContext()
  const q = sp.q?.slice(0, 100)
  const data = await listCompanies(ctx, { q, page: Number(sp.page) || 1 })

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader title="Empresas" description="Contas, clientes e prospects." actions={<NewCompanyButton />} />
      <SearchInput placeholder="Buscar por nome, domínio ou setor…" className="sm:max-w-sm" />

      {data.total === 0 && !q ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma empresa ainda"
          description="Cadastre as contas que seu time atende para agrupar contatos e negócios."
          action={<NewCompanyButton label="Adicionar empresa" />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="hidden w-full text-[13px] md:table">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Empresa</th>
                <th className="px-4 py-2.5 font-medium">Setor</th>
                <th className="px-4 py-2.5 font-medium">Funcionários</th>
                <th className="px-4 py-2.5 text-right font-medium">Contatos</th>
                <th className="px-4 py-2.5 text-right font-medium">Pipeline aberto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((c) => (
                <tr key={c.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link href={`/app/companies/${c.id}`} className="flex items-center gap-2.5">
                      <EntityAvatar name={c.name} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium group-hover:underline">{c.name}</span>
                        {c.domain && <span className="block truncate text-xs text-muted-foreground">{c.domain}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.industry ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.size ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular">{c.contactCount}</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular">
                    {c.pipelineCents > 0 ? formatCompactBRL(c.pipelineCents) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y md:hidden">
            {data.rows.map((c) => (
              <li key={c.id}>
                <Link href={`/app/companies/${c.id}`} className="flex items-center gap-3 p-4">
                  <EntityAvatar name={c.name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[c.industry, `${c.contactCount} contato(s)`].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {c.pipelineCents > 0 && <span className="text-sm font-semibold tabular">{formatCompactBRL(c.pipelineCents)}</span>}
                </Link>
              </li>
            ))}
          </ul>
          {data.rows.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Nenhum resultado para “{q}”.</p>}
        </div>
      )}
      <Pagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/app/companies" q={q} />
    </div>
  )
}
