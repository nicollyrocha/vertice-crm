import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Features } from "@/components/marketing/features"
import { Hero } from "@/components/marketing/hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Logos } from "@/components/marketing/logos"
import { Pricing } from "@/components/marketing/pricing"
import { Testimonials } from "@/components/marketing/testimonials"

export default function HomePage() {
  return (
    <>
      <Hero />
      <Logos />
      <Features />
      <HowItWorks />
      <Testimonials />
      <div className="border-t bg-muted/30">
        <Pricing />
      </div>
      <FAQ />
      <CTA />
    </>
  )
}
