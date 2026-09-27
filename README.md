# Vértice CRM

CRM SaaS multi-tenant para times de vendas B2B, feito com Next.js 16, Neon Postgres e Auth.js e pronto para deploy na Vercel.

## O que já vem pronto

- **Landing page** com hero, recursos, como funciona, depoimentos, preços, FAQ e CTA. Também inclui as páginas `/pricing`, `/terms` e `/privacy`.
- **Autenticação:** cadastro, login (email e senha, com Google e GitHub opcionais), verificação de email, recuperação de senha e aceite de convite.
- **Conta:** foto de perfil (Vercel Blob), nome, troca de email com confirmação no novo endereço e troca de senha, com aviso por email.
- **Multi-tenant:**
  - Organizações com papéis de proprietário, administrador e membro.
  - Convites por email e troca de organização.
  - Transferência de propriedade.
- **CRM:**
  - Dashboard com KPIs, receita e pipeline por estágio.
  - Negócios em kanban (arrastar e soltar) e em lista.
  - Contatos, empresas, atividades, notas e timeline.
  - Busca global com `Ctrl/⌘ K`.
  - Pipeline configurável.
- **UI:**
  - Tema claro e escuro, totalmente responsiva.
  - Sidebar colapsável que vira drawer no mobile.
  - Estados vazios, skeletons e toasts.

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 · shadcn/ui · Drizzle ORM · Neon (driver HTTP serverless) · Auth.js v5 · Resend · Vercel Blob · Recharts · dnd-kit · Zod · Vitest · Playwright

## Rodando localmente

```bash
npm install
cp .env.example .env.local      # preencha DATABASE_URL e AUTH_SECRET
npx auth secret                 # gera AUTH_SECRET
npm run db:migrate              # cria as tabelas no Neon
npm run db:seed                 # opcional: dados demo (demo@vertice.app / demo12345)
npm run dev
```

Em desenvolvimento, sem `RESEND_API_KEY`, os links de email (verificação, reset e convite) são **impressos no terminal**.

## Deploy na Vercel

1. Suba o repositório no GitHub e importe o projeto na Vercel.
2. Em **Storage**, crie um banco **Neon**. A variável `DATABASE_URL` é injetada automaticamente.
3. Em **Storage**, crie um **Blob store**, que injeta `BLOB_READ_WRITE_TOKEN`.
4. Em **Settings → Environment Variables**, adicione:
   - `AUTH_SECRET`, gerado com `npx auth secret`.
   - `NEXT_PUBLIC_APP_URL`, por exemplo `https://crm.suaempresa.com.br`.
   - `RESEND_API_KEY` e `EMAIL_FROM`, com o domínio verificado no Resend.
   - Opcionais: `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` e `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`.
5. Rode as migrations contra o banco de produção com `DATABASE_URL=... npm run db:migrate`, ou adicione `npm run db:migrate &&` ao build command.
6. Faça o deploy.

**Callbacks OAuth:** `https://SEU_DOMINIO/api/auth/callback/google` e `.../github`.

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` / `npm run typecheck` | ESLint e TypeScript |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Smoke tests (Playwright) |
| `npm run db:generate` | Gera migration a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica migrations |
| `npm run db:studio` | Drizzle Studio |
| `npm run db:seed` | Dados demo |

## Arquitetura

```
src/
  app/(marketing)     landing, preços, termos e privacidade
  app/(auth)          login, cadastro, senha, verificação, convite, onboarding
  app/app             área logada (layout com sidebar)
  server/context.ts   requireUser / requireOrgContext: sessão + organização ativa
  server/data/*       leituras, sempre filtradas por orgId
  server/actions/*    Server Actions (validação Zod + checagem de papel)
  db/schema.ts        schema Drizzle (fonte da verdade do banco)
  config/site.ts      nome da marca, planos e URLs
```

**Regras de segurança:**
- Toda query de negócio recebe um `ctx` resolvido no servidor. O `orgId` nunca vem do cliente.
- IDs referenciados, como empresa, contato e responsável, são validados contra a organização (`server/data/guards.ts`).
- Senhas usam bcrypt (custo 12).
- Tokens de email são de uso único, com hash SHA-256 no banco.
- Há rate limit (Postgres) no login, cadastro, recuperação de senha e convites.
- O `proxy.ts` faz só checagem otimista. A autorização real acontece no servidor.

## Personalização

- **Marca:** altere `src/config/site.ts` (nome, textos, planos) e `src/components/logo.tsx`.
- **Cores:** mude os tokens em `src/app/globals.css`. `--brand` é o acento, e `--primary` é o CTA.
- **Fuso horário:** `APP_TZ` em `src/lib/dates.ts` (padrão `America/Sao_Paulo`).

## Próximos passos sugeridos

Cobrança com Stripe, importação CSV, integrações de email e calendário, automações e sessões revogáveis (hoje a sessão é um JWT de 30 dias).
