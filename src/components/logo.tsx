import Link from "next/link"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <defs>
        <linearGradient id="vx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.62 0.22 290)" />
          <stop offset="1" stopColor="oklch(0.48 0.24 280)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#vx-g)" />
      <path d="M9 10.5 16 22l7-11.5" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="9.5" r="2" fill="white" fillOpacity=".7" />
    </svg>
  )
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      <span className="text-[17px]">{siteConfig.name}</span>
    </Link>
  )
}
