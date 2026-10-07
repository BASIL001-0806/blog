"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Blob,
  Button,
  Card,
  ErrorBox,
  LinkButton,
  Loading,
  Sticker,
  inputCls,
  type Color,
} from "@/components/ui";
import { api, formatDate, type CommentItem, type PostItem } from "@/lib/api";

const commentColors: Color[] = ["lemon", "sky", "lime", "tangerine", "white"];

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ post: PostItem }>(`/api/posts/${id}`),
      api<{ comments: CommentItem[] }>(`/api/posts/${id}/comments`),
    ])
      .then(([p, c]) => {
        setPost(p.post);
        setComments(c.comments);
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function handleDeletePost() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api(`/api/posts/${id}`, { method: "DELETE" });
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault();
    setCommentError("");
    setBusy(true);
    try {
      const d = await api<{ comment: CommentItem }>(`/api/posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });
      setComments((prev) => [...prev, d.comment]);
      setCommentText("");
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : "Failed to comment");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!confirm("Delete this comment?")) return;
    try {
      await api(`/api/comments/${commentId}`, { method: "DELETE" });
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (error)
    return (
      <div className="space-y-4">
        <ErrorBox>{error}</ErrorBox>
        <LinkButton href="/" color="white">
          ← Back to feed
        </LinkButton>
      </div>
    );
  if (!post) return <Loading label="Fetching the goods" />;

  const isOwner = user?.id === post.authorId;
  const edited = post.updatedAt !== post.createdAt;

  return (
    <div className="relative space-y-12">
      <Blob className="-left-36 top-20 w-72 animate-float" color="#19c7ff" />
      <Blob className="-right-32 top-1/3 w-64 animate-spin-slow" color="#ffe600" />
      <Blob className="-left-24 bottom-20 w-56 animate-float" color="#ff6a00" />

      <Link
        href="/"
        className="inline-flex items-center gap-2 font-display text-sm uppercase underline decoration-hot decoration-4 underline-offset-4"
      >
        ← Back to the feed
      </Link>

      {/* POST */}
      <article>
        <Card color="white" className="p-7 sm:p-12">
          <div className="absolute -top-5 left-6 flex gap-2">
            <Sticker color="hot" rotate={-6}>
              Post #{post.id}
            </Sticker>
            {edited && (
              <Sticker color="sky" rotate={5}>
                Edited
              </Sticker>
            )}
          </div>
          <span className="absolute -right-4 -top-7 text-5xl animate-wiggle">📣</span>

          <h1 className="font-display text-4xl uppercase leading-[0.95] sm:text-6xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-y-[3px] border-ink py-4">
            <Avatar name={post.authorName} size={44} />
            <div>
              <div className="font-display text-sm uppercase tracking-wider">
                @{post.authorName}
              </div>
              <div className="text-xs font-medium opacity-70">
                {formatDate(post.createdAt)}
                {edited && <> · edited {formatDate(post.updatedAt)}</>}
              </div>
            </div>
            {isOwner && (
              <div className="ml-auto flex gap-3">
                <LinkButton href={`/posts/${post.id}/edit`} color="lemon" size="sm">
                  ✏️ Edit
                </LinkButton>
                <Button color="hot" size="sm" onClick={handleDeletePost}>
                  🗑 Delete
                </Button>
              </div>
            )}
          </div>

          <div className="prose-lg mt-8 whitespace-pre-line text-lg font-medium leading-relaxed first-letter:float-left first-letter:mr-3 first-letter:border-[3px] first-letter:border-ink first-letter:bg-lemon first-letter:px-3 first-letter:font-display first-letter:text-6xl first-letter:leading-none first-letter:shadow-pop">
            {post.content}
          </div>
        </Card>
      </article>

      {/* COMMENTS */}
      <section className="relative">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">
            <span className="bg-grape px-3 py-1 text-white">Comments</span>{" "}
            <span className="bg-lime px-3 py-1">{comments.length}</span>
          </h2>
          <span className="font-fun text-lg text-hot">bring the heat 🔥</span>
        </div>

        {comments.length === 0 ? (
          <Card color="white" className="bg-dots p-8 text-center">
            <p className="font-display text-2xl uppercase">Crickets… 🦗</p>
            <p className="mt-1 font-medium">Be the first to react.</p>
          </Card>
        ) : (
          <ul className="space-y-6">
            {comments.map((c, i) => (
              <li
                key={c.id}
                className={i % 2 ? "sm:ml-10 rotate-[0.5deg]" : "sm:mr-10 -rotate-[0.5deg]"}
              >
                <Card color={commentColors[i % commentColors.length]} className="p-5">
                  <div className="flex items-start gap-3">
                    <Avatar name={c.authorName} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-xs uppercase tracking-wider">
                          @{c.authorName}
                          <span className="ml-2 font-body text-[11px] font-medium normal-case tracking-normal opacity-70">
                            {formatDate(c.createdAt)}
                          </span>
                        </span>
                        {user?.id === c.authorId && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="border-[3px] border-ink bg-white px-2 py-0.5 text-[11px] font-bold uppercase shadow-pop hover:bg-hot hover:text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-2 whitespace-pre-line font-medium leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          {user ? (
            <Card color="white" className="p-6">
              <span className="absolute -left-4 -top-5">
                <Sticker color="grape" rotate={-6}>
                  Your turn
                </Sticker>
              </span>
              <form onSubmit={handleAddComment} className="space-y-4">
                {commentError && <ErrorBox>{commentError}</ErrorBox>}
                <div className="flex gap-3">
                  <Avatar name={user.username} size={40} />
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    required
                    maxLength={2000}
                    placeholder="Say something loud…"
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold opacity-60">
                    {commentText.length}/2000
                  </span>
                  <Button
                    type="submit"
                    color="grape"
                    disabled={busy || !commentText.trim()}
                  >
                    {busy ? "Posting…" : "Post comment 💬"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card color="lemon" className="bg-dots p-8 text-center">
              <p className="font-display text-2xl uppercase">Got thoughts?</p>
              <p className="mt-1 font-medium">Log in to join the conversation.</p>
              <div className="mt-5 flex justify-center gap-3">
                <LinkButton href="/login" color="white">
                  Log in
                </LinkButton>
                <LinkButton href="/register" color="grape">
                  Register
                </LinkButton>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
