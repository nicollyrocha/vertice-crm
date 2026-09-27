"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Loader2, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Campo de busca que sincroniza `?q=` na URL com debounce (reseta a paginação). */
export function SearchInput({ placeholder, className }: { placeholder: string; className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [value, setValue] = useState(params.get("q") ?? "")
  const [pending, start] = useTransition()

  useEffect(() => {
    const current = params.get("q") ?? ""
    if (value === current) return
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params)
      if (value) sp.set("q", value)
      else sp.delete("q")
      sp.delete("page")
      start(() => router.replace(`${pathname}?${sp}`))
    }, 300)
    return () => clearTimeout(t)
  }, [value, params, pathname, router])

  return (
    <div className={cn("relative w-full", className)}>
      {pending ? (
        <Loader2 className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8 pr-8"
        aria-label="Buscar"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
