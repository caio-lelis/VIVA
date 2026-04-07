import { NextResponse } from "next/server"

const AUTH_COOKIE_NAME = "viva_auth"
const ROLE_COOKIE_NAME = "viva_role"
const COOKIE_SECURE = process.env.AUTH_COOKIE_SECURE === "true"

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    maxAge: 0,
  })
  response.cookies.set(ROLE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    maxAge: 0,
  })
  return response
}
