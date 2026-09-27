import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const tones = [
  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  "bg-rose-500/15 text-rose-700 dark:text-rose-300",
]

function toneFor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return tones[h % tones.length]
}

export function UserAvatar({
  name,
  image,
  className,
}: {
  name: string | null | undefined
  image?: string | null
  className?: string
}) {
  const label = name ?? "?"
  return (
    <Avatar className={cn("size-7", className)}>
      {image && <AvatarImage src={image} alt={label} className="object-cover" />}
      <AvatarFallback className={cn("text-[11px] font-semibold", toneFor(label))}>{initials(label)}</AvatarFallback>
    </Avatar>
  )
}

/** Avatar quadrado para empresas/organizações. */
export function EntityAvatar({ name, image, className }: { name: string; image?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center overflow-hidden rounded-md border text-[11px] font-semibold",
        !image && toneFor(name),
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="size-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  )
}
