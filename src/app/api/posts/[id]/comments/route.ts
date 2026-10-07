import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: Request, { params }: Ctx) {
  const postId = parseId((await params).id);
  if (!postId)
    return Response.json({ error: "Invalid post id" }, { status: 400 });

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      postId: comments.postId,
      authorId: comments.authorId,
      authorName: users.username,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));

  return Response.json({ comments: rows });
}

export async function POST(req: Request, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const postId = parseId((await params).id);
  if (!postId)
    return Response.json({ error: "Invalid post id" }, { status: 400 });

  const [post] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body.content?.trim() ?? "";
  if (!content || content.length > 2000) {
    return Response.json(
      { error: "Comment is required (max 2000 characters)" },
      { status: 400 }
    );
  }

  const [comment] = await db
    .insert(comments)
    .values({ content, postId, authorId: user.id })
    .returning();

  return Response.json(
    { comment: { ...comment, authorName: user.username } },
    { status: 201 }
  );
}
