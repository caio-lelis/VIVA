import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "viva_auth"
const ROLE_COOKIE_NAME = "viva_role"

type Role = "admin" | "morador"

export async function GET(request: NextRequest) {
  const isAuthenticated = request.cookies.get(AUTH_COOKIE_NAME)?.value === "1"
  const role = request.cookies.get(ROLE_COOKIE_NAME)?.value as Role | undefined

  if (!isAuthenticated || (role !== "admin" && role !== "morador")) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true, role })
}
