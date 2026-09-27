export const siteConfig = {
  name: "Vértice",
  tagline: "O CRM que sua equipe de vendas vai querer usar",
  description:
    "Pipeline visual, contatos, empresas e atividades num só lugar. O Vértice ajuda times B2B a fechar mais negócios com menos planilha.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: "suporte@vertice.app",
  links: {
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
  },
}

export const orgCookie = "vx_org"

export type Plan = {
  id: string
  name: string
  description: string
  priceMonthly: number | null
  highlight?: boolean
  cta: string
  features: string[]
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Para quem está organizando as primeiras vendas.",
    priceMonthly: 0,
    cta: "Começar grátis",
    features: ["Até 2 usuários", "1 pipeline", "500 contatos", "Dashboard essencial", "Suporte por email"],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Para times que vivem de pipeline cheio.",
    priceMonthly: 79,
    highlight: true,
    cta: "Testar 14 dias grátis",
    features: [
      "Usuários ilimitados",
      "Pipelines ilimitados",
      "Contatos ilimitados",
      "Relatórios avançados",
      "Papéis e permissões",
      "Suporte prioritário",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para operações com requisitos de segurança e escala.",
    priceMonthly: null,
    cta: "Falar com vendas",
    features: ["Tudo do Pro", "SSO / SAML", "SLA de 99,9%", "Gerente de conta dedicado", "Onboarding assistido"],
  },
]
