"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { OrgOption } from "./org-switcher"
import { SidebarContent } from "./sidebar"

export function MobileNav(props: { orgs: OrgOption[]; activeOrgId: string; badges: { overdue: number } }) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SidebarContent {...props} mobile onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
