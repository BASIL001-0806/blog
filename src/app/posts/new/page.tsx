"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { PostForm } from "@/components/PostForm";
import { Blob, Card, LinkButton, Loading, Sticker } from "@/components/ui";
import { ApiError, api, type PostItem } from "@/lib/api";

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) {
    return (
      <Card color="lemon" className="bg-dots mx-auto max-w-lg p-10 text-center">
        <p className="font-display text-3xl uppercase">Members only 🔒</p>
        <p className="mt-2 font-medium">
          You need to be logged in to publish a post.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <LinkButton href="/login" color="white">
            Log in
          </LinkButton>
          <LinkButton href="/register" color="grape">
            Register
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl">
      <Blob className="-left-32 top-10 w-64 animate-float" color="#ffe600" />
      <Blob className="-right-28 bottom-10 w-56 animate-spin-slow" color="#19c7ff" />

      <div className="mb-6">
        <Sticker color="hot" rotate={-5}>
          Drafting as @{user.username}
        </Sticker>
        <h1 className="mt-4 font-display text-5xl uppercase leading-none text-outline text-sky drop-shadow-[5px_5px_0_#0b0b14] sm:text-6xl">
          New post
        </h1>
      </div>

      <Card color="white" className="p-7 sm:p-9">
        <span className="absolute -right-5 -top-6 rotate-12 text-5xl">✍️</span>
        <PostForm
          submitLabel="Publish it 🚀"
          onSubmit={async (data) => {
            try {
              const d = await api<{ post: PostItem }>("/api/posts", {
                method: "POST",
                body: JSON.stringify(data),
              });
              router.push(`/posts/${d.post.id}`);
            } catch (e) {
              if (e instanceof ApiError && e.status === 401) {
                throw new Error(
                  "Your session has expired. Please log in again, then re-submit your post."
                );
              }
              throw e;
            }
          }}
        />
      </Card>
    </div>
  );
}
