import { auth } from "@/auth"
import { Footer } from "@/components/marketing/footer"
import { MarketingHeader } from "@/components/marketing/header"

async function isLoggedIn() {
  try {
    return Boolean((await auth())?.user)
  } catch {
    return false
  }
}

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader loggedIn={await isLoggedIn()} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
