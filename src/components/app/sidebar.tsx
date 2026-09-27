"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { mainNav, settingsItem } from "./nav"
import { OrgSwitcher, type OrgOption } from "./org-switcher"
import { openCommandMenu } from "./command-menu"

export const sidebarCookie = "vx_sidebar"

type Props = {
  orgs: OrgOption[]
  activeOrgId: string
  badges: { overdue: number }
  defaultCollapsed?: boolean
  onNavigate?: () => void
  mobile?: boolean
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  badge,
  onNavigate,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  collapsed: boolean
  badge?: number
  onNavigate?: () => void
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13.5px] text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
        active &&
          "bg-sidebar-accent font-medium text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_var(--sidebar-border),0_1px_2px_rgb(0_0_0/0.04)]",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-brand" : "text-muted-foreground group-hover:text-foreground")} />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!!badge && (
        <span
          className={cn(
            "grid h-4.5 min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white tabular",
            collapsed && "absolute right-0.5 top-0.5 h-3.5 min-w-3.5 text-[9px]",
          )}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function SidebarContent({ orgs, activeOrgId, badges, defaultCollapsed = false, onNavigate, mobile }: Props) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(mobile ? false : defaultCollapsed)

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    document.cookie = `${sidebarCookie}=${next ? "1" : "0"}; path=/; max-age=31536000; samesite=lax`
  }

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href))

  return (
    <div className={cn("flex h-full flex-col gap-4 p-3 transition-[width] duration-200", collapsed ? "w-[60px]" : mobile ? "w-full" : "w-60")}>
      <OrgSwitcher orgs={orgs} activeId={activeOrgId} collapsed={collapsed} />

      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          openCommandMenu()
        }}
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg border bg-background px-2 text-[13px] text-muted-foreground shadow-xs transition-colors hover:text-foreground",
          collapsed && "justify-center px-0",
        )}
        aria-label="Buscar"
      >
        <Search className="size-3.5" />
        {!collapsed && (
          <>
            Buscar…
            <kbd className="ml-auto rounded border bg-muted px-1.5 font-mono text-[10px]">Ctrl K</kbd>
          </>
        )}
      </button>

      <nav className="grid gap-0.5">
        {mainNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href, item.exact)}
            collapsed={collapsed}
            badge={item.badgeKey ? badges[item.badgeKey] : undefined}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto grid gap-0.5">
        <NavLink
          href={settingsItem.href}
          label={settingsItem.label}
          icon={settingsItem.icon}
          active={pathname.startsWith(settingsItem.match)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
        {!mobile && (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex h-8 items-center gap-2.5 rounded-lg px-2 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent/70 hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && "Recolher"}
          </button>
        )}
      </div>
    </div>
  )
}

export function Sidebar(props: Omit<Props, "mobile" | "onNavigate">) {
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 border-r bg-sidebar lg:block">
      <SidebarContent {...props} />
    </aside>
  )
}
