import type { Metadata } from "next"
import { Check, Minus } from "lucide-react"
import { FAQ } from "@/components/marketing/faq"
import { Pricing } from "@/components/marketing/pricing"

export const metadata: Metadata = { title: "Preços" }

const rows: [string, (string | boolean)[]][] = [
  ["Usuários", ["Até 2", "Ilimitados", "Ilimitados"]],
  ["Contatos", ["500", "Ilimitados", "Ilimitados"]],
  ["Pipelines", ["1", "Ilimitados", "Ilimitados"]],
  ["Dashboard e forecast", [true, true, true]],
  ["Papéis e permissões", [false, true, true]],
  ["Relatórios avançados", [false, true, true]],
  ["SSO / SAML", [false, false, true]],
  ["SLA garantido", [false, false, true]],
  ["Suporte", ["Email", "Prioritário", "Gerente dedicado"]],
]

export default function PricingPage() {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        <div className="mx-auto max-w-3xl px-4 pt-20 text-center">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">Planos para cada fase do seu time</h1>
          <p className="mt-4 text-lg text-muted-foreground">Comece grátis e faça upgrade só quando fizer sentido.</p>
        </div>
        <Pricing heading={false} />
      </div>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <h2 className="mb-6 text-2xl font-semibold tracking-tight">Compare os planos</h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-4 font-medium">Recurso</th>
                <th className="p-4 font-medium">Starter</th>
                <th className="p-4 font-medium">Pro</th>
                <th className="p-4 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, vals]) => (
                <tr key={label} className="border-t">
                  <td className="p-4 text-muted-foreground">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="p-4">
                      {v === true ? (
                        <Check className="size-4 text-brand" />
                      ) : v === false ? (
                        <Minus className="size-4 text-muted-foreground/50" />
                      ) : (
                        v
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <FAQ />
    </>
  )
}
