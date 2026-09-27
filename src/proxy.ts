import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

// Instância leve (sem banco): só lê o JWT da sessão.
const { auth } = NextAuth(authConfig)

const authPages = ["/login", "/signup"]

// Checagem otimista: a autorização real acontece em src/server/context.ts.
export default auth((req) => {
  const { pathname, search } = req.nextUrl
  const isLoggedIn = Boolean(req.auth?.user)
  const isProtected = pathname.startsWith("/app") || pathname.startsWith("/onboarding")

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl)
    url.searchParams.set("callbackUrl", pathname + search)
    return NextResponse.redirect(url)
  }
  if (isLoggedIn && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", req.nextUrl))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*", "/login", "/signup"],
}
