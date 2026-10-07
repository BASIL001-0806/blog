"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { PostForm } from "@/components/PostForm";
import { Blob, Card, ErrorBox, LinkButton, Loading, Sticker } from "@/components/ui";
import { api, type PostItem } from "@/lib/api";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [post, setPost] = useState<PostItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ post: PostItem }>(`/api/posts/${id}`)
      .then((d) => setPost(d.post))
      .catch((e: Error) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (loading || !post) return <Loading />;
  if (!user || user.id !== post.authorId) {
    return (
      <Card color="tangerine" className="mx-auto max-w-lg p-10 text-center">
        <p className="font-display text-3xl uppercase">Not yours to edit 🙅</p>
        <p className="mt-2 font-medium">Only the author can change this post.</p>
        <div className="mt-6">
          <LinkButton href={`/posts/${id}`} color="white">
            ← Back to post
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <Blob className="-right-32 top-0 w-64 animate-float" color="#a3ff12" />
      <Blob className="-left-28 bottom-10 w-56 animate-spin-slow" color="#ff2e88" />

      <div className="mb-6">
        <Sticker color="lime" rotate={4}>
          Editing #{post.id}
        </Sticker>
        <h1 className="mt-4 font-display text-5xl uppercase leading-none text-outline text-tangerine drop-shadow-[5px_5px_0_#0b0b14] sm:text-6xl">
          Edit post
        </h1>
      </div>

      <Card color="white" className="p-7 sm:p-9">
        <span className="absolute -left-5 -top-6 -rotate-12 text-5xl">🛠️</span>
        <PostForm
          initialTitle={post.title}
          initialContent={post.content}
          submitLabel="Save changes ✔"
          onSubmit={async (data) => {
            await api(`/api/posts/${id}`, {
              method: "PUT",
              body: JSON.stringify(data),
            });
            router.push(`/posts/${id}`);
          }}
        />
      </Card>
    </div>
  );
}
