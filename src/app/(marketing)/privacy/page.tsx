import type { Metadata } from "next"
import { LegalPage } from "@/components/marketing/legal-page"

export const metadata: Metadata = { title: "Privacidade" }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Política de privacidade"
      updated="27 de setembro de 2026"
      sections={[
        {
          h: "Dados que coletamos",
          p: "Nome, email, foto de perfil opcional e os dados comerciais que sua organização cadastra (empresas, contatos, negócios e atividades).",
        },
        {
          h: "Como usamos",
          p: "Para operar o serviço, autenticar usuários, enviar emails transacionais (verificação, redefinição de senha, convites) e melhorar o produto.",
        },
        {
          h: "Compartilhamento",
          p: "Não vendemos dados. Usamos subprocessadores de infraestrutura (hospedagem, banco de dados, envio de email e armazenamento de arquivos).",
        },
        {
          h: "Segurança",
          p: "Senhas com hash bcrypt, tokens de uso único armazenados como hash, isolamento por organização e conexões criptografadas.",
        },
        {
          h: "Seus direitos (LGPD)",
          p: "Você pode acessar, corrigir, exportar ou solicitar a exclusão dos seus dados pessoais a qualquer momento.",
        },
      ]}
    />
  )
}
