import { cookies } from "next/headers"
import { CommandMenu } from "@/components/app/command-menu"
import { MobileNav } from "@/components/app/mobile-nav"
import { Sidebar, sidebarCookie } from "@/components/app/sidebar"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { UserMenu } from "@/components/app/user-menu"
import { VerifyBanner } from "@/components/app/verify-banner"
import { LogoMark } from "@/components/logo"
import { getUserOrgs, requireOrgContext } from "@/server/context"
import { countOverdue } from "@/server/data/activities"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireOrgContext()
  const [orgs, overdue, store] = await Promise.all([getUserOrgs(ctx.user.id), countOverdue(ctx), cookies()])
  const orgOptions = orgs.map((o) => ({ id: o.org.id, name: o.org.name, logoUrl: o.org.logoUrl, role: o.role }))
  const nav = { orgs: orgOptions, activeOrgId: ctx.org.id, badges: { overdue } }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar {...nav} defaultCollapsed={store.get(sidebarCookie)?.value === "1"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl sm:px-6">
          <MobileNav {...nav} />
          <LogoMark className="size-6 lg:hidden" />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu user={{ name: ctx.user.name, email: ctx.user.email, image: ctx.user.image }} />
          </div>
        </header>
        {!ctx.user.emailVerified && <VerifyBanner email={ctx.user.email} />}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <CommandMenu />
    </div>
  )
}
