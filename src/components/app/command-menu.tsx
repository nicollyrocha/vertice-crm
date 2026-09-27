"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { Building2, CheckSquare, Home, KanbanSquare, Loader2, Moon, Plus, Settings, Sun, User, Users } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { searchAction } from "@/server/actions/search"
import type { SearchHit } from "@/server/data/search"

const OPEN_EVENT = "vx:command-open"

export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

const hitIcon = { deal: KanbanSquare, contact: User, company: Building2 }
const hitHref = { deal: "/app/deals/", contact: "/app/contacts/", company: "/app/companies/" }

export function CommandMenu() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [pending, start] = useTransition()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) return
    const t = setTimeout(() => start(async () => setHits(await searchAction(query))), 200)
    return () => clearTimeout(t)
  }, [query])

  const searching = query.trim().length >= 2

  function go(href: string) {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Busca" description="Busque ou execute um comando">
      <Command shouldFilter={query.trim().length < 2}>
        <CommandInput placeholder="Buscar negócios, contatos, empresas…" value={query} onValueChange={setQuery} />
        <CommandList className="max-h-[min(420px,60vh)]">
          <CommandEmpty>
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Buscando…
              </span>
            ) : (
              "Nada encontrado."
            )}
          </CommandEmpty>
          {searching && hits.length > 0 && (
            <CommandGroup heading="Resultados">
              {hits.map((h) => {
                const Icon = hitIcon[h.type]
                return (
                  <CommandItem key={`${h.type}-${h.id}`} value={`${h.type}-${h.id}`} onSelect={() => go(hitHref[h.type] + h.id)}>
                    <Icon />
                    <span className="truncate">{h.label}</span>
                    {h.sub && <span className="ml-auto truncate text-xs text-muted-foreground">{h.sub}</span>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
          {query.trim().length < 2 && (
            <>
              <CommandGroup heading="Ir para">
                <CommandItem onSelect={() => go("/app")}>
                  <Home /> Início
                </CommandItem>
                <CommandItem onSelect={() => go("/app/deals")}>
                  <KanbanSquare /> Negócios
                </CommandItem>
                <CommandItem onSelect={() => go("/app/contacts")}>
                  <Users /> Contatos
                </CommandItem>
                <CommandItem onSelect={() => go("/app/companies")}>
                  <Building2 /> Empresas
                </CommandItem>
                <CommandItem onSelect={() => go("/app/activities")}>
                  <CheckSquare /> Atividades
                </CommandItem>
                <CommandItem onSelect={() => go("/app/settings/profile")}>
                  <Settings /> Configurações
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Ações">
                <CommandItem onSelect={() => go("/app/deals?new=1")}>
                  <Plus /> Novo negócio
                </CommandItem>
                <CommandItem onSelect={() => go("/app/contacts?new=1")}>
                  <Plus /> Novo contato
                </CommandItem>
                <CommandItem onSelect={() => go("/app/companies?new=1")}>
                  <Plus /> Nova empresa
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                    setOpen(false)
                  }}
                >
                  {resolvedTheme === "dark" ? <Sun /> : <Moon />} Alternar tema
                  <CommandShortcut>Tema</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
