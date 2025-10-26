// src/app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { signSession, sessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email and password are required" },
        { status: 400 }
      );
    }
    const adminPass = process.env.ADMIN_PASSWORD;
    if (!adminPass) {
      return NextResponse.json(
        { ok: false, error: "Server misconfigured: ADMIN_PASSWORD missing" },
        { status: 500 }
      );
    }
    if (password !== adminPass) {
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }
    const token = signSession(email);
    const res = NextResponse.json({ ok: true });
    res.headers.append("Set-Cookie", sessionCookie(token));
    return res;
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Login failed" },
      { status: 500 }
    );
  }
}
