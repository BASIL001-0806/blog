import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

export const SESSION_COOKIE = "blog_session";
export const TOKEN_HEADER = "x-session-token";
export const TOKEN_QUERY = "token";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const existing = Buffer.from(hash, "hex");
  if (derived.length !== existing.length) return false;
  return timingSafeEqual(derived, existing);
}

async function isSecureRequest(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") return true;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "";
  return proto.split(",")[0].trim() === "https";
}

/**
 * Creates a session row and returns the token. The token is also set as a
 * cookie as a convenience, but the client primarily sends it back via
 * headers / query string so auth works even when a proxy or iframe sandbox
 * strips cookies or the Authorization header.
 */
export async function createSession(userId: number): Promise<string> {
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ token, userId, expiresAt });

  const secure = await isSecureRequest();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export type TokenTransports = {
  authorization: boolean;
  header: boolean;
  query: boolean;
  cookie: boolean;
};

const TOKEN_RE = /^[a-f0-9]{96}$/i;

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/**
 * Pulls the session token from the request, trying every transport the
 * client might use. Reads directly from the Request object so nothing is
 * lost between the edge and the handler.
 */
export async function extractToken(
  req?: Request
): Promise<{ token: string | null; seen: TokenTransports }> {
  const seen: TokenTransports = {
    authorization: false,
    header: false,
    query: false,
    cookie: false,
  };
  const candidates: string[] = [];

  const h = req ? req.headers : await headers();

  const auth = h.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    const t = auth.slice(7).trim();
    if (t) {
      seen.authorization = true;
      candidates.push(t);
    }
  }

  const custom = h.get(TOKEN_HEADER)?.trim();
  if (custom) {
    seen.header = true;
    candidates.push(custom);
  }

  if (req) {
    try {
      const q = new URL(req.url).searchParams.get(TOKEN_QUERY)?.trim();
      if (q) {
        seen.query = true;
        candidates.push(q);
      }
    } catch {
      /* ignore malformed URL */
    }
  }

  let cookieToken: string | null = null;
  if (req) {
    cookieToken = parseCookie(h.get("cookie"), SESSION_COOKIE);
  } else {
    const cookieStore = await cookies();
    cookieToken = cookieStore.get(SESSION_COOKIE)?.value ?? null;
  }
  if (cookieToken) {
    seen.cookie = true;
    candidates.push(cookieToken);
  }

  const token = candidates.find((t) => TOKEN_RE.test(t)) ?? null;
  return { token, seen };
}

export async function destroySession(req?: Request) {
  const { token } = await extractToken(req);
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export type SafeUser = { id: number; username: string; email: string };

export async function lookupUserByToken(
  token: string | null
): Promise<SafeUser | null> {
  if (!token) return null;
  const rows = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCurrentUser(req?: Request): Promise<SafeUser | null> {
  const { token } = await extractToken(req);
  return lookupUserByToken(token);
}

export function unauthorized() {
  return Response.json({ error: "Authentication required" }, { status: 401 });
}
