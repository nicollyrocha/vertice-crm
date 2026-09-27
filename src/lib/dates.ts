/** Fuso usado para "hoje", "este mês" e exibição de datas. Servidores (Vercel) rodam em UTC. */
export const APP_TZ = "America/Sao_Paulo"

function zonedParts(date: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute"), second: get("second") }
}

/** Offset do fuso em minutos (ex.: São Paulo = -180). */
export function tzOffsetMinutes(date: Date, tz = APP_TZ) {
  const p = zonedParts(date, tz)
  const asUTC = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return Math.round((asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000)
}

/** Converte uma "hora de parede" no fuso para instante UTC. */
function wallTimeToUtc(year: number, month: number, day: number, tz: string) {
  const guess = Date.UTC(year, month - 1, day)
  return new Date(guess - tzOffsetMinutes(new Date(guess), tz) * 60000)
}

export function startOfDayInTz(date = new Date(), tz = APP_TZ) {
  const p = zonedParts(date, tz)
  return wallTimeToUtc(p.year, p.month, p.day, tz)
}

export function startOfMonthInTz(offsetMonths = 0, date = new Date(), tz = APP_TZ) {
  const p = zonedParts(date, tz)
  const total = p.year * 12 + (p.month - 1) + offsetMonths
  return wallTimeToUtc(Math.floor(total / 12), (total % 12) + 1, 1, tz)
}

/** "YYYY-MM-DD" -> meio-dia UTC, que cai no mesmo dia em qualquer fuso do Brasil. */
export function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const d = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}
