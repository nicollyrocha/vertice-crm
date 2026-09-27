import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/** <select> nativo estilizado: funciona direto com FormData e é ótimo no mobile. */
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="native-select"
        className={cn(
          "h-9 w-full appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-8 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive md:text-sm dark:bg-input/30 [&>option]:bg-popover",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

export { NativeSelect }
