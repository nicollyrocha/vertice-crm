import { cn } from "@/lib/utils"

/** Seção de configurações: descrição à esquerda, conteúdo à direita (empilha no mobile). */
export function SettingsSection({
  title,
  description,
  children,
  footer,
  danger,
}: {
  title: string
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  danger?: boolean
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-card", danger && "border-destructive/30")}>
      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[220px_1fr]">
        <div>
          <h2 className={cn("text-sm font-semibold", danger && "text-destructive")}>{title}</h2>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t bg-muted/30 px-5 py-3 sm:px-6">{footer}</div>
      )}
    </section>
  )
}
