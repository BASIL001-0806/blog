import { eq } from "drizzle-orm";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { getCurrentUser, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(req: Request, { params }: Ctx) {
  const user = await getCurrentUser(req);
  if (!user) return unauthorized();

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid comment id" }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: comments.id, authorId: comments.authorId })
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);

  if (!existing)
    return Response.json({ error: "Comment not found" }, { status: 404 });
  if (existing.authorId !== user.id) {
    return Response.json(
      { error: "You can only delete your own comments" },
      { status: 403 }
    );
  }

  await db.delete(comments).where(eq(comments.id, id));
  return Response.json({ ok: true });
}
