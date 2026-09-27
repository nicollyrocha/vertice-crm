import { APP_TZ } from "./dates"

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatBRL(cents: number) {
  return brl.format(cents / 100)
}

export function formatCompactBRL(cents: number) {
  return brlCompact.format(cents / 100)
}

/** "1.234,56" | "R$ 10" -> centavos. String vazia = 0, inválida = NaN. */
export function parseBRLToCents(input: string) {
  const cleaned = input.replace(/R\$|\s/g, "").replace(/\./g, "").replace(",", ".")
  if (cleaned === "") return 0
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return NaN
  return Math.round(Number(cleaned) * 100)
}

export function centsToInput(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function initials(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0][0]
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ""
  return (first + last).toUpperCase()
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: APP_TZ })
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: APP_TZ,
})
const relFmt = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" })

export function formatDate(d: Date | string | null | undefined) {
  if (!d) return "—"
  return dateFmt.format(new Date(d)).replace(" de ", " ").replace(".", "")
}

export function formatDateTime(d: Date | string | null | undefined) {
  if (!d) return "—"
  return dateTimeFmt.format(new Date(d))
}

export function formatRelative(d: Date | string, now = new Date()) {
  const diff = (new Date(d).getTime() - now.getTime()) / 1000
  const abs = Math.abs(diff)
  if (abs < 60) return relFmt.format(Math.round(diff), "second")
  if (abs < 3600) return relFmt.format(Math.round(diff / 60), "minute")
  if (abs < 86400) return relFmt.format(Math.round(diff / 3600), "hour")
  if (abs < 86400 * 30) return relFmt.format(Math.round(diff / 86400), "day")
  if (abs < 86400 * 365) return relFmt.format(Math.round(diff / (86400 * 30)), "month")
  return relFmt.format(Math.round(diff / (86400 * 365)), "year")
}

export function formatPercent(n: number) {
  return `${Math.round(n)}%`
}

const timeFmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: APP_TZ })

export function formatTime(d: Date | string | null | undefined) {
  return d ? timeFmt.format(new Date(d)) : ""
}
