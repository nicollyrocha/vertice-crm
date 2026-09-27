"use client"

import Link from "next/link"
import { useTransition } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { switchOrgAction } from "@/server/actions/org"
import { EntityAvatar } from "./user-avatar"

export type OrgOption = { id: string; name: string; logoUrl: string | null; role: string }

export function OrgSwitcher({ orgs, activeId, collapsed }: { orgs: OrgOption[]; activeId: string; collapsed?: boolean }) {
  const active = orgs.find((o) => o.id === activeId) ?? orgs[0]
  const [pending, start] = useTransition()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-lg p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
          pending && "opacity-60",
        )}
      >
        <EntityAvatar name={active.name} image={active.logoUrl} className="size-7 rounded-lg" />
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight">{active.name}</div>
              <div className="text-[11px] text-muted-foreground">Plano Starter</div>
            </div>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Organizações</DropdownMenuLabel>
        {orgs.map((o) => (
          <DropdownMenuItem
            key={o.id}
            onSelect={() => o.id !== active.id && start(() => switchOrgAction(o.id).then(() => undefined))}
            className="gap-2"
          >
            <EntityAvatar name={o.name} image={o.logoUrl} className="size-6" />
            <span className="flex-1 truncate">{o.name}</span>
            {o.id === active.id && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/onboarding">
            <span className="grid size-6 place-items-center rounded-md border border-dashed">
              <Plus className="size-3.5" />
            </span>
            Nova organização
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
