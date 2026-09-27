import Link from "next/link"
import { Logo } from "@/components/logo"
import { siteConfig } from "@/config/site"

const cols = [
  {
    title: "Produto",
    links: [
      ["Recursos", "/#recursos"],
      ["Preços", "/pricing"],
      ["Como funciona", "/#como-funciona"],
    ],
  },
  {
    title: "Empresa",
    links: [
      ["Contato", `mailto:${siteConfig.supportEmail}`],
      ["LinkedIn", siteConfig.links.linkedin],
      ["X / Twitter", siteConfig.links.twitter],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Termos de uso", "/terms"],
      ["Privacidade", "/privacy"],
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{siteConfig.tagline}.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-medium">{c.title}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </span>
          <span>Feito no Brasil 🇧🇷</span>
        </div>
      </div>
    </footer>
  )
}
