import { describe, expect, it } from "vitest"
import { can, canChangeRole, canRemoveMember } from "@/server/permissions"

describe("can", () => {
  it("owner pode tudo", () => {
    expect(can("owner", "org:delete")).toBe(true)
    expect(can("owner", "members:invite")).toBe(true)
  })
  it("admin gerencia, mas não apaga org", () => {
    expect(can("admin", "org:update")).toBe(true)
    expect(can("admin", "members:invite")).toBe(true)
    expect(can("admin", "pipeline:manage")).toBe(true)
    expect(can("admin", "org:delete")).toBe(false)
  })
  it("member não tem ações administrativas", () => {
    expect(can("member", "org:update")).toBe(false)
    expect(can("member", "members:invite")).toBe(false)
    expect(can("member", "pipeline:manage")).toBe(false)
  })
})

describe("canChangeRole", () => {
  it("só owner promove a owner ou mexe em owner", () => {
    expect(canChangeRole("owner", "member", "owner")).toBe(true)
    expect(canChangeRole("admin", "member", "owner")).toBe(false)
    expect(canChangeRole("admin", "owner", "member")).toBe(false)
  })
  it("admin alterna member/admin", () => {
    expect(canChangeRole("admin", "member", "admin")).toBe(true)
    expect(canChangeRole("admin", "admin", "member")).toBe(true)
  })
  it("member nunca muda papel", () => {
    expect(canChangeRole("member", "member", "admin")).toBe(false)
  })
})

describe("canRemoveMember", () => {
  it("ninguém remove owner; admin remove member/admin", () => {
    expect(canRemoveMember("admin", "owner")).toBe(false)
    expect(canRemoveMember("owner", "owner")).toBe(false)
    expect(canRemoveMember("admin", "member")).toBe(true)
    expect(canRemoveMember("member", "member")).toBe(false)
  })
})
