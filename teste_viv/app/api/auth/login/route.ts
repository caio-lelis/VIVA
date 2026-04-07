import { NextRequest, NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "viva_auth"
const ROLE_COOKIE_NAME = "viva_role"
const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === "true"
type Role = "admin" | "morador"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = String(body?.username || "")
    const password = String(body?.password || "")

    const credentials: Array<{ role: Role; user: string; password: string }> = [
      {
        role: "admin",
        user: process.env.PORTAL_ADMIN_USER || process.env.PORTAL_USER || "admin",
        password: process.env.PORTAL_ADMIN_PASSWORD || process.env.PORTAL_PASSWORD || "admin123",
      },
      {
        role: "morador",
        user: process.env.PORTAL_MORADOR_USER || "morador",
        password: process.env.PORTAL_MORADOR_PASSWORD || "viva2026",
      },
    ]
    const matched = credentials.find((item) => username === item.user && password === item.password)

    if (!matched) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true, role: matched.role })
    response.cookies.set(AUTH_COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      path: "/",
      maxAge: 60 * 60 * 12,
    })
    response.cookies.set(ROLE_COOKIE_NAME, matched.role, {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      path: "/",
      maxAge: 60 * 60 * 12,
    })
    return response
  } catch {
    return NextResponse.json({ success: false, error: "Requisição inválida" }, { status: 400 })
  }
}
