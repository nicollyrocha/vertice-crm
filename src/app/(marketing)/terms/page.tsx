import type { Metadata } from "next"
import { LegalPage } from "@/components/marketing/legal-page"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = { title: "Termos de uso" }

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de uso"
      updated="27 de setembro de 2026"
      sections={[
        {
          h: "Aceitação",
          p: `Ao criar uma conta no ${siteConfig.name}, você concorda com estes termos e com nossa Política de Privacidade.`,
        },
        {
          h: "Conta e segurança",
          p: "Você é responsável por manter a confidencialidade das suas credenciais e por todas as atividades realizadas na sua conta.",
        },
        {
          h: "Uso aceitável",
          p: "É proibido usar o serviço para enviar spam, armazenar conteúdo ilícito ou tentar acessar dados de outras organizações.",
        },
        {
          h: "Dados do cliente",
          p: "Os dados inseridos pela sua organização pertencem a ela. Você pode exportá-los ou excluí-los a qualquer momento.",
        },
        {
          h: "Planos e cancelamento",
          p: "Planos pagos são cobrados mensalmente e podem ser cancelados a qualquer momento, com efeito ao fim do período vigente.",
        },
        {
          h: "Limitação de responsabilidade",
          p: "O serviço é fornecido “como está”. Empenhamos esforços razoáveis para garantir disponibilidade e segurança.",
        },
      ]}
    />
  )
}
