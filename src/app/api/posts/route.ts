import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { comments, posts, users } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      authorName: users.username,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      commentCount: sql<number>`(
        select count(*)::int from ${comments} where ${comments.postId} = ${posts.id}
      )`,
    })
    .from(posts)
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt));

  return Response.json({ posts: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

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

  const [post] = await db
    .insert(posts)
    .values({ title, content, authorId: user.id })
    .returning();

  return Response.json(
    { post: { ...post, authorName: user.username, commentCount: 0 } },
    { status: 201 }
  );
}
