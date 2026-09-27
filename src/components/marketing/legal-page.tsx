export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: { h: string; p: string }[]
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <p className="text-sm text-muted-foreground">Atualizado em {updated}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">{title}</h1>
      <div className="mt-10 space-y-8">
        {sections.map((s, i) => (
          <section key={s.h}>
            <h2 className="text-lg font-semibold">
              {i + 1}. {s.h}
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="mt-12 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
        Modelo de referência. Revise este texto com seu jurídico antes de publicar em produção.
      </p>
    </article>
  )
}
