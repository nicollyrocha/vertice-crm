"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatBRL, formatCompactBRL } from "@/lib/format"

type TooltipPayload = { value: number; payload: Record<string, unknown> }

function ChartTooltip({
  active,
  payload,
  label,
  extra,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
  extra?: (p: Record<string, unknown>) => string | null
}) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="font-medium capitalize text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular text-popover-foreground">{formatBRL(p.value)}</div>
      {extra?.(p.payload) && <div className="mt-0.5 text-muted-foreground">{extra(p.payload)}</div>}
    </div>
  )
}

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 }

/** Receita ganha por mês — série única: área em wash de 10% + linha de 2px. */
export function RevenueChart({ data }: { data: { label: string; wonCents: number }[] }) {
  return (
    <div className="h-48 w-full" role="img" aria-label="Receita ganha nos últimos 6 meses">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} dy={6} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            width={64}
            tickFormatter={(v: number) => formatCompactBRL(v)}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "0" }}
            content={<ChartTooltip />}
          />
          <Area
            type="monotone"
            dataKey="wonCents"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="var(--chart-1)"
            fillOpacity={0.1}
            activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2, fill: "var(--chart-1)" }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Valor aberto por estágio — barras horizontais de série única (≤ 24px, ponta arredondada). */
export function StageBarChart({ data }: { data: { name: string; valueCents: number; count: number }[] }) {
  const height = Math.max(160, data.length * 40)
  return (
    <div className="w-full" style={{ height }} role="img" aria-label="Valor em aberto por estágio">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke="var(--border)" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={axisTick}
            tickFormatter={(v: number) => formatCompactBRL(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={96}
            tick={{ ...axisTick, fill: "var(--foreground)" }}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={<ChartTooltip extra={(p) => `${p.count} negócio(s)`} />}
          />
          <Bar dataKey="valueCents" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
