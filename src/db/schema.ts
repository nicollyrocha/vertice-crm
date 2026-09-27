import { relations } from "drizzle-orm"
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
const createdAt = () => timestamp("created_at", { mode: "date" }).notNull().defaultNow()
const updatedAt = () =>
  timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

export const roleEnum = pgEnum("role", ["owner", "admin", "member"])
export const dealStatusEnum = pgEnum("deal_status", ["open", "won", "lost"])
export const activityTypeEnum = pgEnum("activity_type", ["task", "call", "meeting", "email"])
export const tokenTypeEnum = pgEnum("token_type", ["password_reset", "email_verify", "email_change"])

// ───────────────────────────── Auth.js ─────────────────────────────

export const users = pgTable("users", {
  id: id(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
)

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
)

// ───────────────────────── Tokens & rate limit ─────────────────────────

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: tokenTypeEnum("type").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    payload: jsonb("payload").$type<{ newEmail?: string }>(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    usedAt: timestamp("used_at", { mode: "date" }),
    createdAt: createdAt(),
  },
  (t) => [index("auth_tokens_user_idx").on(t.userId, t.type)],
)

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  resetAt: timestamp("reset_at", { mode: "date" }).notNull(),
})

// ───────────────────────────── Tenancy ─────────────────────────────

export const organizations = pgTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const memberships = pgTable(
  "memberships",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull().default("member"),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.orgId] }), index("memberships_org_idx").on(t.orgId)],
)

export const invitations = pgTable(
  "invitations",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: roleEnum("role").notNull().default("member"),
    tokenHash: text("token_hash").notNull().unique(),
    invitedBy: text("invited_by").references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    acceptedAt: timestamp("accepted_at", { mode: "date" }),
    createdAt: createdAt(),
  },
  (t) => [index("invitations_org_idx").on(t.orgId)],
)

// ───────────────────────────── CRM ─────────────────────────────

export const companies = pgTable(
  "companies",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    domain: text("domain"),
    industry: text("industry"),
    size: text("size"),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("companies_org_idx").on(t.orgId, t.name)],
)

export const contacts = pgTable(
  "contacts",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    companyId: text("company_id").references(() => companies.id, { onDelete: "set null" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name"),
    email: text("email"),
    phone: text("phone"),
    title: text("title"),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("contacts_org_idx").on(t.orgId, t.firstName), index("contacts_company_idx").on(t.companyId)],
)

export const pipelines = pgTable(
  "pipelines",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("pipelines_org_idx").on(t.orgId)],
)

export const stages = pgTable(
  "stages",
  {
    id: id(),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull(),
    probability: integer("probability").notNull().default(0),
    color: text("color").notNull().default("violet"),
    isWon: boolean("is_won").notNull().default(false),
  },
  (t) => [index("stages_pipeline_idx").on(t.pipelineId, t.position)],
)

export const deals = pgTable(
  "deals",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    pipelineId: text("pipeline_id")
      .notNull()
      .references(() => pipelines.id, { onDelete: "cascade" }),
    stageId: text("stage_id")
      .notNull()
      .references(() => stages.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    valueCents: bigint("value_cents", { mode: "number" }).notNull().default(0),
    currency: text("currency").notNull().default("BRL"),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
    companyId: text("company_id").references(() => companies.id, { onDelete: "set null" }),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "set null" }),
    expectedCloseDate: timestamp("expected_close_date", { mode: "date" }),
    status: dealStatusEnum("status").notNull().default("open"),
    closedAt: timestamp("closed_at", { mode: "date" }),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("deals_org_stage_idx").on(t.orgId, t.stageId, t.position),
    index("deals_contact_idx").on(t.contactId),
    index("deals_company_idx").on(t.companyId),
  ],
)

export const activities = pgTable(
  "activities",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    type: activityTypeEnum("type").notNull().default("task"),
    title: text("title").notNull(),
    description: text("description"),
    dueAt: timestamp("due_at", { mode: "date" }),
    completedAt: timestamp("completed_at", { mode: "date" }),
    dealId: text("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    companyId: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
    assigneeId: text("assignee_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("activities_org_due_idx").on(t.orgId, t.dueAt)],
)

export const notes = pgTable(
  "notes",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    authorId: text("author_id").references(() => users.id, { onDelete: "set null" }),
    dealId: text("deal_id").references(() => deals.id, { onDelete: "cascade" }),
    contactId: text("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
    companyId: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [index("notes_org_idx").on(t.orgId, t.createdAt)],
)

export type EntityType = "deal" | "contact" | "company"

export const activityLog = pgTable(
  "activity_log",
  {
    id: id(),
    orgId: text("org_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
    entityType: text("entity_type").$type<EntityType>().notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    createdAt: createdAt(),
  },
  (t) => [index("activity_log_entity_idx").on(t.orgId, t.entityType, t.entityId, t.createdAt)],
)

// ───────────────────────────── Relations ─────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({ memberships: many(memberships) }))
export const organizationsRelations = relations(organizations, ({ many }) => ({ memberships: many(memberships) }))
export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  org: one(organizations, { fields: [memberships.orgId], references: [organizations.id] }),
}))
export const companiesRelations = relations(companies, ({ one, many }) => ({
  owner: one(users, { fields: [companies.ownerId], references: [users.id] }),
  contacts: many(contacts),
  deals: many(deals),
}))
export const contactsRelations = relations(contacts, ({ one, many }) => ({
  company: one(companies, { fields: [contacts.companyId], references: [companies.id] }),
  owner: one(users, { fields: [contacts.ownerId], references: [users.id] }),
  deals: many(deals),
}))
export const pipelinesRelations = relations(pipelines, ({ many }) => ({ stages: many(stages) }))
export const stagesRelations = relations(stages, ({ one, many }) => ({
  pipeline: one(pipelines, { fields: [stages.pipelineId], references: [pipelines.id] }),
  deals: many(deals),
}))
export const dealsRelations = relations(deals, ({ one }) => ({
  stage: one(stages, { fields: [deals.stageId], references: [stages.id] }),
  contact: one(contacts, { fields: [deals.contactId], references: [contacts.id] }),
  company: one(companies, { fields: [deals.companyId], references: [companies.id] }),
  owner: one(users, { fields: [deals.ownerId], references: [users.id] }),
}))
export const activitiesRelations = relations(activities, ({ one }) => ({
  deal: one(deals, { fields: [activities.dealId], references: [deals.id] }),
  contact: one(contacts, { fields: [activities.contactId], references: [contacts.id] }),
  company: one(companies, { fields: [activities.companyId], references: [companies.id] }),
  assignee: one(users, { fields: [activities.assigneeId], references: [users.id] }),
}))
export const notesRelations = relations(notes, ({ one }) => ({
  author: one(users, { fields: [notes.authorId], references: [users.id] }),
}))
export const activityLogRelations = relations(activityLog, ({ one }) => ({
  actor: one(users, { fields: [activityLog.actorId], references: [users.id] }),
}))

export type User = typeof users.$inferSelect
export type Organization = typeof organizations.$inferSelect
export type Role = (typeof roleEnum.enumValues)[number]
export type Company = typeof companies.$inferSelect
export type Contact = typeof contacts.$inferSelect
export type Stage = typeof stages.$inferSelect
export type Deal = typeof deals.$inferSelect
export type Activity = typeof activities.$inferSelect
export type ActivityType = (typeof activityTypeEnum.enumValues)[number]
export type Note = typeof notes.$inferSelect
