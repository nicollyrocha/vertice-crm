const brands = [
  { name: "Nimbus", className: "font-bold tracking-tight" },
  { name: "ORBE", className: "font-mono font-semibold tracking-[0.3em]" },
  { name: "kappa", className: "font-extrabold lowercase italic" },
  { name: "Solaris", className: "font-medium tracking-wide" },
  { name: "ATLAS/CO", className: "font-semibold tracking-widest" },
  { name: "Lumen", className: "font-serif text-[1.35rem] italic" },
]

export function Logos() {
  return (
    <section className="border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Mais de 2.000 times comerciais confiam no Vértice
        </p>
        <div className="mt-7 grid grid-cols-3 items-center gap-y-6 text-center text-xl text-muted-foreground/70 sm:grid-cols-6">
          {brands.map((b) => (
            <span key={b.name} className={b.className}>
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
