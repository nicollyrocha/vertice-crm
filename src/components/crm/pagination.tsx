import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Pagination({
  page,
  pageCount,
  total,
  basePath,
  q,
}: {
  page: number
  pageCount: number
  total: number
  basePath: string
  q?: string
}) {
  const href = (p: number) => {
    const sp = new URLSearchParams()
    if (q) sp.set("q", q)
    if (p > 1) sp.set("page", String(p))
    const s = sp.toString()
    return s ? `${basePath}?${s}` : basePath
  }
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span className="tabular">
        {total} registro{total === 1 ? "" : "s"}
      </span>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <span className="tabular">
            Página {page} de {pageCount}
          </span>
          <Button asChild variant="outline" size="icon-sm" aria-disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
            <Link href={href(page - 1)} aria-label="Página anterior">
              <ChevronLeft />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="icon-sm"
            aria-disabled={page >= pageCount}
            className={page >= pageCount ? "pointer-events-none opacity-50" : ""}
          >
            <Link href={href(page + 1)} aria-label="Próxima página">
              <ChevronRight />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
