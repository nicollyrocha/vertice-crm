import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft className="size-4" /> {label}
    </Link>
  )
}

export function DetailGrid({ main, aside }: { main: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">{main}</div>
      <aside className="space-y-6">{aside}</aside>
    </div>
  )
}

export function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

export function Properties({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-3 text-sm">
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-[110px_1fr] items-center gap-2">
          <dt className="text-muted-foreground">{it.label}</dt>
          <dd className="min-w-0 truncate">{it.value ?? <span className="text-muted-foreground">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-sm font-medium">{children}</h2>
}
