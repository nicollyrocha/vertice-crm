import { Building2, CheckSquare, Home, KanbanSquare, Settings, Users } from "lucide-react"

export const mainNav = [
  { href: "/app", label: "Início", icon: Home, exact: true },
  { href: "/app/deals", label: "Negócios", icon: KanbanSquare },
  { href: "/app/contacts", label: "Contatos", icon: Users },
  { href: "/app/companies", label: "Empresas", icon: Building2 },
  { href: "/app/activities", label: "Atividades", icon: CheckSquare, badgeKey: "overdue" as const },
]

export const settingsNav = [
  { href: "/app/settings/profile", label: "Perfil" },
  { href: "/app/settings/organization", label: "Organização" },
  { href: "/app/settings/members", label: "Membros" },
  { href: "/app/settings/pipeline", label: "Pipeline" },
]

export const settingsItem = { href: "/app/settings/profile", match: "/app/settings", label: "Configurações", icon: Settings }
