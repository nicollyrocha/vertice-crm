export const defaultStages = [
  { name: "Lead", probability: 10, color: "slate", isWon: false },
  { name: "Qualificado", probability: 25, color: "sky", isWon: false },
  { name: "Proposta", probability: 50, color: "violet", isWon: false },
  { name: "Negociação", probability: 75, color: "amber", isWon: false },
  { name: "Ganho", probability: 100, color: "emerald", isWon: true },
] as const

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "org"
  )
}
