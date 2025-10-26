// src/lib/auth.ts
import crypto from "crypto";

const SESSION_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionPayload = {
  email: string;
  exp: number; // epoch seconds
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

export function signSession(email: string): string {
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");
  return `${payloadB64}.${hmac}`;
}

export function verifySession(token?: string): SessionPayload | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string): string {
  const maxAge = SESSION_TTL_SECONDS;
  // Secure; HttpOnly; SameSite=Lax for admin
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; ${
    process.env.NODE_ENV === "production" ? "Secure;" : ""
  }`;
}

export const COOKIE_NAME = SESSION_COOKIE;
