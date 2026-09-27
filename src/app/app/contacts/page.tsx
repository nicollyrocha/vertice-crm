import type { Metadata } from "next"
import Link from "next/link"
import { Mail, Phone, Users } from "lucide-react"
import { EmptyState, PageHeader } from "@/components/app/page-header"
import { UserAvatar } from "@/components/app/user-avatar"
import { NewContactButton } from "@/components/crm/create-button"
import { Pagination } from "@/components/crm/pagination"
import { SearchInput } from "@/components/crm/search-input"
import { formatDate } from "@/lib/format"
import { requireOrgContext } from "@/server/context"
import { companyOptions } from "@/server/data/companies"
import { listContacts } from "@/server/data/contacts"

export const metadata: Metadata = { title: "Contatos" }

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams
  const ctx = await requireOrgContext()
  const q = sp.q?.slice(0, 100)
  const [data, companies] = await Promise.all([
    listContacts(ctx, { q, page: Number(sp.page) || 1 }),
    companyOptions(ctx),
  ])
  const name = (c: { firstName: string; lastName: string | null }) => [c.firstName, c.lastName].filter(Boolean).join(" ")

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <PageHeader title="Contatos" description="As pessoas com quem seu time conversa." actions={<NewContactButton companies={companies} />} />
      <SearchInput placeholder="Buscar por nome, email ou empresa…" className="sm:max-w-sm" />

      {data.total === 0 && !q ? (
        <EmptyState
          icon={Users}
          title="Nenhum contato ainda"
          description="Adicione as pessoas dos seus clientes e prospects para registrar conversas e negócios."
          action={<NewContactButton companies={companies} label="Adicionar contato" />}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <table className="hidden w-full text-[13px] md:table">
            <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Empresa</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Telefone</th>
                <th className="px-4 py-2.5 text-right font-medium">Negócios abertos</th>
                <th className="px-4 py-2.5 font-medium">Criado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.rows.map((c) => (
                <tr key={c.id} className="group transition-colors hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link href={`/app/contacts/${c.id}`} className="flex items-center gap-2.5">
                      <UserAvatar name={name(c)} className="size-7" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium group-hover:underline">{name(c)}</span>
                        {c.title && <span className="block truncate text-xs text-muted-foreground">{c.title}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    {c.companyId ? (
                      <Link href={`/app/companies/${c.companyId}`} className="hover:underline">
                        {c.companyName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular">
                    {c.openDeals > 0 ? (
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{c.openDeals}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="divide-y md:hidden">
            {data.rows.map((c) => (
              <li key={c.id}>
                <Link href={`/app/contacts/${c.id}`} className="flex items-center gap-3 p-4">
                  <UserAvatar name={name(c)} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{name(c)}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {[c.title, c.companyName].filter(Boolean).join(" · ") || c.email}
                    </div>
                  </div>
                  <div className="flex gap-1 text-muted-foreground">
                    {c.email && <Mail className="size-4" />}
                    {c.phone && <Phone className="size-4" />}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {data.rows.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">Nenhum resultado para “{q}”.</p>}
        </div>
      )}
      <Pagination page={data.page} pageCount={data.pageCount} total={data.total} basePath="/app/contacts" q={q} />
    </div>
  )
}
