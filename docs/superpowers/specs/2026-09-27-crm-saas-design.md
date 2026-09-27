# Vértice CRM — Design Spec

Data: 2026-09-27
Status: aprovado

## Objetivo

CRM SaaS multi-tenant de vendas B2B, pronto para produção na Vercel, com landing page vendável, dashboard, sidebar e sistema de conta completo. Interface 100% em PT-BR, moeda BRL.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions), TypeScript strict |
| UI | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, Geist (sans/mono) |
| Banco | Neon Postgres via `@neondatabase/serverless` + Drizzle ORM / drizzle-kit |
| Auth | Auth.js v5 (`next-auth@5`), Credentials (email+senha) + Google/GitHub opcionais, sessão JWT |
| Email | Resend (reset de senha, verificação, troca de email, convites) |
| Arquivos | Vercel Blob (foto de perfil, logo da organização) |
| Validação | Zod (compartilhado entre forms e server actions) |
| Gráficos | Recharts |
| Kanban | dnd-kit |
| Testes | Vitest (lógica/validações/tokens), Playwright (smoke dos fluxos críticos) |
| Deploy | Vercel |

Nome da marca "Vértice" é placeholder, centralizado em `src/config/site.ts`.

## Multi-tenant

- `organizations` e `memberships (userId, orgId, role: owner|admin|member)`.
- Organização ativa guardada em cookie `vx_org`; validada contra memberships em cada request.
- Toda leitura/escrita de dados de negócio passa por `src/server/data/*`, que recebe um `ctx` com `userId` e `orgId` já validados (`requireOrgContext()`). Nenhuma query de negócio fora dessa camada.
- Todas as tabelas de negócio têm `org_id` NOT NULL com índice.
- Ao cadastrar, o usuário cria sua primeira organização (onboarding) com um pipeline padrão.
- Ações administrativas (convidar, remover membro, editar pipeline, renomear org) exigem `admin` ou `owner`.

## Modelo de dados

- **Auth.js:** `users` (id, name, email, emailVerified, image, passwordHash, createdAt), `accounts`, `sessions` (não usada com JWT, mantida pelo adapter), `verification_tokens`.
- **auth_tokens:** (id, userId, type: `password_reset|email_verify|email_change`, tokenHash, payload jsonb, expiresAt, usedAt). Tokens em texto são enviados apenas por email; no banco guarda-se o SHA-256.
- **organizations:** id, name, slug, logoUrl, createdAt.
- **memberships:** userId, orgId, role, createdAt.
- **invitations:** id, orgId, email, role, tokenHash, invitedBy, expiresAt, acceptedAt.
- **companies:** id, orgId, name, domain, industry, size, ownerId, createdAt.
- **contacts:** id, orgId, companyId?, firstName, lastName, email, phone, title, ownerId, createdAt.
- **pipelines:** id, orgId, name. **stages:** id, pipelineId, name, position, probability, color.
- **deals:** id, orgId, pipelineId, stageId, title, valueCents, currency, contactId?, companyId?, ownerId, expectedCloseDate, status: `open|won|lost`, position, createdAt.
- **activities:** id, orgId, type: `task|call|meeting|email`, title, dueAt, completedAt, dealId?, contactId?, companyId?, assigneeId.
- **notes:** id, orgId, body, authorId, dealId?, contactId?, companyId?.
- **activity_log:** id, orgId, actorId, entityType, entityId, action, meta jsonb, createdAt (timeline).

## Páginas

### Públicas
- `/`: landing com hero, logos, features, preview do produto, depoimentos, preços e FAQ, além de um CTA final e footer.
- `/pricing`, `/terms`, `/privacy`.

### Auth
- `/login`, `/signup`, `/forgot-password`, `/reset-password?token=`, `/verify-email?token=`, `/invite/[token]`, `/onboarding` (criar primeira organização).

### App (`/app`, layout com sidebar colapsável, drawer no mobile)
- `/app`: dashboard com KPIs (pipeline aberto, ganhos no mês, taxa de conversão, atividades atrasadas), receita por estágio, funil, atividades de hoje e negócios recentes.
- `/app/deals`: kanban por estágio com drag-and-drop e alternância para lista. `/app/deals/[id]`: detalhe com notas, atividades e timeline.
- `/app/contacts` e `/app/contacts/[id]`.
- `/app/companies` e `/app/companies/[id]`.
- `/app/activities`: agrupadas em atrasadas, hoje e próximas, com opção de concluir.
- `/app/settings/profile`: nome, foto (upload no Blob), troca de email (confirmação por link enviado ao novo email) e troca de senha (exige a senha atual).
- `/app/settings/organization`: nome e logo.
- `/app/settings/members`: lista, convites, papéis e remoção.
- `/app/settings/pipeline`: CRUD e reordenação de estágios.
- Command palette ⌘K (navegação e busca de contatos, empresas e negócios) e alternância de tema.

## Fluxos de conta

- **Cadastro:** nome, email e senha (mínimo 8 caracteres). O sistema envia um email de verificação e redireciona para `/onboarding`. O banner "verifique seu email" aparece até a verificação.
- **Esqueci a senha:** a resposta é sempre genérica (não revela se o email existe). O token expira em 1h e é de uso único. Ao redefinir, os tokens pendentes são invalidados.
- **Trocar senha:** exige a senha atual.
- **Trocar email:** o token (24h) é enviado ao novo email e o email só muda depois da confirmação. O email antigo recebe um aviso.
- **Foto:** jpg/png/webp com no máximo 2MB, validada no servidor e enviada ao Vercel Blob. A URL fica em `users.image`.
- **OAuth:** Google e GitHub, ativados apenas se as env vars existirem.

## Segurança

- bcryptjs (custo 12).
- Rate limit (tabela `rate_limits` no Postgres, janela fixa) no login, cadastro, esqueci a senha e reenvio de verificação.
- O middleware protege `/app/*` e redireciona o usuário logado que acessa as páginas de auth.
- As server actions revalidam a sessão e a organização. Nunca se confia em `orgId` vindo do cliente.
- Headers de segurança em `next.config`.

## Design visual

- Direção inspirada em Linear, Attio e Vercel: base neutra (zinc) densa e legível, um acento de marca (violeta/índigo), bordas de 1px, raio de 10px, sombras suaves e dark mode de primeira classe.
- Geist Sans/Mono, números tabulares nas métricas.
- Landing com mais impacto visual: gradiente radial sutil, grid de fundo, screenshot do produto em perspectiva, seções com ritmo variado (bento de features, split sections) e animações discretas no scroll.
- Responsivo: sidebar vira drawer abaixo de `lg`, tabelas viram cards no mobile, kanban com scroll horizontal.
- Estados vazios ilustrados, skeletons de loading, toasts (sonner) e confirmações para ações destrutivas.

## Tratamento de erros

- Server actions retornam `{ ok: true, data } | { ok: false, error, fieldErrors? }`. Os forms exibem erros por campo.
- `error.tsx` e `not-found.tsx` por segmento.
- Emails: se `RESEND_API_KEY` não estiver definida em desenvolvimento, o link é logado no console.

## Testes

- Vitest: schemas Zod, utilitários de token (geração, hash, expiração), formatação BRL, checagem de permissões e rate limit.
- Playwright (smoke): landing renderiza, cadastro → onboarding → dashboard, login/logout.
- Verificação mínima antes de entregar: `tsc --noEmit`, `next lint` e `next build`.

## Entregáveis

- Repositório com `.env.example` documentado, `drizzle` migrations, `npm run db:seed` (org demo com dados), README de setup (Neon, Resend, Blob, OAuth, deploy na Vercel).

## Fora de escopo (v1)

Billing/Stripe, i18n, tickets/inbox, integrações de email/calendário, importação CSV, automações, API pública.
