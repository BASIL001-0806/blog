import { eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function findPost(id: number) {
  const [row] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      authorName: users.username,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1);
  return row ?? null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Invalid post id" }, { status: 400 });

  const post = await findPost(id);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  return Response.json({ post });
}

export async function PUT(req: Request, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Invalid post id" }, { status: 400 });

  const existing = await findPost(id);
  if (!existing)
    return Response.json({ error: "Post not found" }, { status: 404 });
  if (existing.authorId !== user.id) {
    return Response.json(
      { error: "You can only edit your own posts" },
      { status: 403 }
    );
  }

  let body: { title?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim() ?? "";
  const content = body.content?.trim() ?? "";
  if (!title || title.length > 200) {
    return Response.json(
      { error: "Title is required (max 200 characters)" },
      { status: 400 }
    );
  }
  if (!content) {
    return Response.json({ error: "Content is required" }, { status: 400 });
  }

  await db
    .update(posts)
    .set({ title, content, updatedAt: new Date() })
    .where(eq(posts.id, id));

  return Response.json({ post: await findPost(id) });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Invalid post id" }, { status: 400 });

  const existing = await findPost(id);
  if (!existing)
    return Response.json({ error: "Post not found" }, { status: 404 });
  if (existing.authorId !== user.id) {
    return Response.json(
      { error: "You can only delete your own posts" },
      { status: 403 }
    );
  }

  await db.delete(posts).where(eq(posts.id, id));
  return Response.json({ ok: true });
}
