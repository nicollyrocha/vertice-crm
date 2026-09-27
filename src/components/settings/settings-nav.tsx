"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { settingsNav } from "@/components/app/nav"
import { cn } from "@/lib/utils"

export function SettingsNav() {
  const pathname = usePathname()
  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b px-4 scrollbar-none sm:mx-0 sm:px-0">
      {settingsNav.map((item) => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative whitespace-nowrap px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active && "font-medium text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
