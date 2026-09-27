import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { siteConfig } from "@/config/site"

const faqs = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Não. O plano Starter é gratuito para sempre para até 2 usuários, e o teste do Pro não pede cartão.",
  },
  {
    q: "Consigo personalizar os estágios do pipeline?",
    a: "Sim. Você cria, renomeia, reordena e define a probabilidade de cada estágio. O forecast usa essas probabilidades.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Os dados de cada organização são isolados. Senhas são armazenadas com hash bcrypt, tokens são de uso único e há limite de tentativas contra força bruta.",
  },
  {
    q: "Posso convidar meu time?",
    a: "Sim. Convide por email e defina papéis de Proprietário, Administrador ou Membro.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Pode. Não existe fidelidade. Você cancela direto nas configurações, sem falar com ninguém.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="mx-auto grid max-w-7xl scroll-mt-20 gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
      <div>
        <p className="text-sm font-medium text-brand">FAQ</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
        <p className="mt-4 text-muted-foreground">
          Não achou o que procurava? Escreva para{" "}
          <a className="font-medium text-foreground underline underline-offset-4" href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`f${i}`}>
            <AccordionTrigger className="py-5 text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
