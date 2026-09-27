/**
 * Popula o banco com uma organização demo.
 *   npm run db:seed
 * Login: demo@vertice.app / demo12345 (idempotente: recria a org demo a cada execução).
 */
import { eq } from "drizzle-orm"
import { hashPassword } from "../lib/password"
import { defaultStages } from "../lib/org"
import { getDb } from "./index"
import * as s from "./schema"

const DEMO_EMAIL = "demo@vertice.app"
const DEMO_PASSWORD = "demo12345"
const DEMO_SLUG = "demo-acme"

const pick = <T,>(arr: readonly T[], i: number) => arr[i % arr.length]
const daysFromNow = (d: number, h = 10) => {
  const date = new Date()
  date.setDate(date.getDate() + d)
  date.setHours(h, 0, 0, 0)
  return date
}

const companyData = [
  ["Nimbus Tecnologia", "nimbus.com.br", "SaaS", "51-200"],
  ["Orbe Logística", "orbelog.com.br", "Logística", "201-500"],
  ["Kappa Log", "kappalog.com", "Transporte", "11-50"],
  ["Solaris Energia", "solaris.eco.br", "Energia", "501-1000"],
  ["Atlas Consultoria", "atlasco.com.br", "Consultoria", "11-50"],
  ["Lumen Saúde", "lumensaude.com.br", "Saúde", "201-500"],
  ["Vértebra Engenharia", "vertebra.eng.br", "Engenharia", "51-200"],
  ["Pixel Varejo", "pixelvarejo.com", "Varejo", "1000+"],
  ["Fluxo Financeiro", "fluxofin.com.br", "Fintech", "51-200"],
  ["Magma Indústria", "magma.ind.br", "Indústria", "501-1000"],
  ["Rede Aurora", "redeaurora.com.br", "Educação", "201-500"],
  ["Tríade Marketing", "triade.mkt.br", "Marketing", "1-10"],
] as const

const firstNames = ["Mariana", "Rafael", "Ana", "João", "Beatriz", "Lucas", "Camila", "Pedro", "Juliana", "Thiago", "Larissa", "Gustavo", "Fernanda", "Bruno", "Patrícia"]
const lastNames = ["Costa", "Souza", "Lima", "Pereira", "Almeida", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Araújo"]
const titles = ["Head de Vendas", "CEO", "Diretor Comercial", "Gerente de Compras", "CFO", "Coordenadora de TI", "COO", "Analista de Procurement"]
const dealNames = ["Licença anual", "Expansão de time", "Plano Pro", "Onboarding Enterprise", "Renovação", "Pacote consultoria", "Migração de CRM", "Integração ERP", "Upgrade de plano", "Projeto piloto"]
const activityTitles = [
  ["call", "Ligar para alinhar proposta"],
  ["meeting", "Reunião de descoberta"],
  ["email", "Enviar proposta revisada"],
  ["task", "Preparar contrato"],
  ["call", "Follow-up pós-demo"],
  ["meeting", "Apresentação para diretoria"],
  ["task", "Atualizar forecast"],
  ["email", "Enviar estudo de caso"],
] as const

async function main() {
  const db = getDb()
  console.log("🌱 Semeando dados demo…")

  // Usuário demo (upsert)
  let user = await db.query.users.findFirst({ where: eq(s.users.email, DEMO_EMAIL) })
  if (!user) {
    ;[user] = await db
      .insert(s.users)
      .values({ name: "Demo Vértice", email: DEMO_EMAIL, emailVerified: new Date(), passwordHash: await hashPassword(DEMO_PASSWORD) })
      .returning()
  }

  // Colegas fictícios (sem senha: não conseguem logar)
  const teammates: s.User[] = []
  for (const [name, email] of [
    ["Rafael Souza", "rafael.demo@vertice.app"],
    ["Ana Lima", "ana.demo@vertice.app"],
  ]) {
    let t = await db.query.users.findFirst({ where: eq(s.users.email, email) })
    if (!t) [t] = await db.insert(s.users).values({ name, email, emailVerified: new Date() }).returning()
    teammates.push(t)
  }
  const owners = [user, ...teammates]

  // Recria a org demo
  await db.delete(s.organizations).where(eq(s.organizations.slug, DEMO_SLUG))
  const [org] = await db.insert(s.organizations).values({ name: "Acme Ltda (demo)", slug: DEMO_SLUG }).returning()
  await db.insert(s.memberships).values([
    { orgId: org.id, userId: user.id, role: "owner" },
    { orgId: org.id, userId: teammates[0].id, role: "admin" },
    { orgId: org.id, userId: teammates[1].id, role: "member" },
  ])
  const [pipeline] = await db.insert(s.pipelines).values({ orgId: org.id, name: "Vendas" }).returning()
  const stages = await db
    .insert(s.stages)
    .values(defaultStages.map((st, position) => ({ ...st, pipelineId: pipeline.id, position })))
    .returning()

  const companies = await db
    .insert(s.companies)
    .values(
      companyData.map(([name, domain, industry, size], i) => ({
        orgId: org.id,
        name,
        domain,
        industry,
        size,
        ownerId: pick(owners, i).id,
        createdAt: daysFromNow(-60 + i * 3),
      })),
    )
    .returning()

  const contacts = await db
    .insert(s.contacts)
    .values(
      Array.from({ length: 30 }, (_, i) => {
        const first = pick(firstNames, i)
        const last = pick(lastNames, i * 7 + 3)
        const company = pick(companies, i)
        return {
          orgId: org.id,
          companyId: company.id,
          firstName: first,
          lastName: last,
          email: `${first}.${last}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase() + `@${company.domain}`,
          phone: `(11) 9${String(8000 + i * 37).padStart(4, "0")}-${String(1000 + i * 91).slice(-4)}`,
          title: pick(titles, i),
          ownerId: pick(owners, i).id,
          createdAt: daysFromNow(-50 + i),
        }
      }),
    )
    .returning()

  const won = stages.find((st) => st.isWon)!
  const positions = new Map<string, number>()
  const dealRows = Array.from({ length: 40 }, (_, i) => {
    const contact = pick(contacts, i * 7)
    const company = companies.find((c) => c.id === contact.companyId)!
    // distribui: maioria aberta, alguns ganhos em meses anteriores, alguns perdidos
    const kind = i % 10 === 0 ? "lost" : i % 4 === 0 ? "won" : "open"
    const stage = kind === "won" ? won : pick(stages.slice(0, -1), Math.floor(i / 2))
    const pos = positions.get(stage.id) ?? 0
    positions.set(stage.id, pos + 1)
    const closedAt = kind === "open" ? null : daysFromNow(-((i * 11) % 170), 15)
    return {
      orgId: org.id,
      pipelineId: pipeline.id,
      stageId: stage.id,
      title: `${pick(dealNames, i)} — ${company.name.split(" ")[0]}`,
      valueCents: (8 + ((i * 37) % 140)) * 1000_00,
      contactId: contact.id,
      companyId: company.id,
      ownerId: pick(owners, i).id,
      expectedCloseDate: daysFromNow(((i * 5) % 50) - 10),
      status: kind as "open" | "won" | "lost",
      closedAt,
      position: pos,
      createdAt: daysFromNow(-40 + (i % 30)),
    }
  })
  const deals = await db.insert(s.deals).values(dealRows).returning()

  const openDeals = deals.filter((d) => d.status === "open")
  await db.insert(s.activities).values(
    Array.from({ length: 25 }, (_, i) => {
      const [type, title] = pick(activityTitles, i)
      const deal = pick(openDeals, i)
      return {
        orgId: org.id,
        type,
        title,
        dueAt: daysFromNow((i % 9) - 3, 9 + (i % 8)),
        completedAt: i % 6 === 0 ? daysFromNow(-1) : null,
        dealId: deal.id,
        assigneeId: i % 3 === 0 ? pick(teammates, i).id : user.id,
      }
    }),
  )

  await db.insert(s.notes).values(
    openDeals.slice(0, 12).map((d, i) => ({
      orgId: org.id,
      dealId: d.id,
      authorId: pick(owners, i).id,
      body: pick(
        [
          "Cliente gostou da demo. Principal objeção é o prazo de implantação — enviar cronograma.",
          "Decisor é o CFO. Precisamos de um business case com ROI em 6 meses.",
          "Concorrente ofereceu 15% de desconto. Vamos defender valor, não preço.",
          "Pediram referências de clientes do mesmo setor.",
        ],
        i,
      ),
    })),
  )

  await db.insert(s.activityLog).values(
    deals.map((d) => ({
      orgId: org.id,
      actorId: d.ownerId,
      entityType: "deal" as const,
      entityId: d.id,
      action: "created",
      createdAt: d.createdAt,
    })),
  )

  console.log(`✅ Pronto! Entre com ${DEMO_EMAIL} / ${DEMO_PASSWORD}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
