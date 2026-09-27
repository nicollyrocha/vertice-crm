import { PageHeader } from "@/components/app/page-header"
import { SettingsNav } from "@/components/settings/settings-nav"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Configurações" description="Gerencie sua conta, organização e time." />
      <SettingsNav />
      <div className="space-y-6">{children}</div>
    </div>
  )
}
