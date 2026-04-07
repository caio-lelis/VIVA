import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const AUTH_COOKIE_NAME = "viva_auth"
const ROLE_COOKIE_NAME = "viva_role"

const PROTECTED_PREFIXES = [
  "/sistema",
  "/upload",
  "/avisos",
  "/reservas",
  "/chamados",
  "/financeiro",
  "/moradores",
  "/enquetes",
  "/relatorios",
]
const ADMIN_ONLY_PREFIXES = ["/financeiro", "/moradores", "/relatorios"]

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1"
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value

  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/sistema", request.url))
  }

  if (isProtectedPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const adminOnlyPath = ADMIN_ONLY_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  if (adminOnlyPath && role !== "admin") {
    const deniedUrl = new URL("/sistema", request.url)
    deniedUrl.searchParams.set("acesso", "negado")
    return NextResponse.redirect(deniedUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|icon.svg|api/upload).*)"],
}
