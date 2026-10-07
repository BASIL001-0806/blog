import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (username.length < 3 || username.length > 50) {
    return Response.json(
      { error: "Username must be 3-50 characters" },
      { status: 400 }
    );
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return Response.json(
      { error: "Username may only contain letters, numbers and underscores" },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.username, username), eq(users.email, email)))
    .limit(1);

  if (existing.length > 0) {
    const conflict =
      existing[0].email === email ? "Email already in use" : "Username taken";
    return Response.json({ error: conflict }, { status: 409 });
  }

  const [user] = await db
    .insert(users)
    .values({ username, email, passwordHash: hashPassword(password) })
    .returning({ id: users.id, username: users.username, email: users.email });

  const token = await createSession(user.id);
  return Response.json({ user, token }, { status: 201 });
}
