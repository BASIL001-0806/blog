"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Avatar,
  Blob,
  Card,
  ErrorBox,
  LinkButton,
  Loading,
  Sticker,
  type Color,
} from "@/components/ui";
import { api, formatDate, type PostItem } from "@/lib/api";

const cardColors: Color[] = ["white", "lemon", "sky", "lime", "tangerine", "white"];
const tilts = ["-rotate-1", "rotate-1", "rotate-0", "-rotate-1", "rotate-1", "rotate-0"];

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ posts: PostItem[] }>("/api/posts")
      .then((d) => setPosts(d.posts))
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="relative overflow-visible">
        <Blob className="-left-32 -top-20 w-72 animate-float" color="#ff2e88" />
        <Blob className="-right-24 top-10 w-64 animate-spin-slow" color="#a3ff12" />
        <Blob className="left-1/2 -bottom-16 w-40 animate-float" color="#7b2cff" />

        <div className="relative border-[3px] border-ink bg-white p-8 shadow-pop-lg sm:p-12">
          <div className="absolute -top-6 left-6 flex gap-2">
            <Sticker color="hot" rotate={-8}>
              New
            </Sticker>
            <Sticker color="lime" rotate={6}>
              Open mic
            </Sticker>
          </div>
          <span className="absolute -right-5 -top-7 text-6xl animate-wiggle">💥</span>

          <h1 className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl">
            <span className="block text-outline text-lemon drop-shadow-[6px_6px_0_#0b0b14]">
              Say it
            </span>
            <span className="block gradient-text text-outline-thin">louder.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed">
            A blog with the volume knob ripped off. Publish your thoughts in
            full colour, argue in the comments, and leave with your ears
            ringing. <span className="font-fun text-hot">More is more.</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <LinkButton href="/posts/new" color="hot" size="lg">
                ✍️ Write a post
              </LinkButton>
            ) : (
              <>
                <LinkButton href="/register" color="hot" size="lg">
                  🎤 Start posting
                </LinkButton>
                <LinkButton href="/login" color="white" size="lg">
                  Log in
                </LinkButton>
              </>
            )}
            <a
              href="#feed"
              className="inline-flex items-center gap-2 self-center font-display text-sm uppercase underline decoration-hot decoration-4 underline-offset-4"
            >
              ↓ Jump to feed
            </a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 border-t-[3px] border-ink pt-6 text-center">
            <Stat n={posts?.length ?? "–"} label="Posts" color="bg-lemon" />
            <Stat
              n={posts?.reduce((a, p) => a + (p.commentCount ?? 0), 0) ?? "–"}
              label="Comments"
              color="bg-sky"
            />
            <Stat n="∞" label="Opinions" color="bg-lime" />
          </div>
        </div>
      </section>

      {/* FEED */}
      <section id="feed" className="relative">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl uppercase sm:text-5xl">
            <span className="bg-ink px-3 py-1 text-lemon">The</span>{" "}
            <span className="bg-hot px-3 py-1 text-white">Feed</span>
          </h2>
          <span className="font-fun text-lg text-grape">freshest first ↓</span>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}
        {!error && !posts && <Loading label="Cranking the volume" />}

        {posts && posts.length === 0 && (
          <Card color="lemon" className="bg-dots p-10 text-center">
            <p className="font-display text-3xl uppercase">
              It&apos;s quiet… too quiet.
            </p>
            <p className="mt-2 font-medium">Nobody has posted yet.</p>
            <div className="mt-6">
              <LinkButton href={user ? "/posts/new" : "/register"} color="hot">
                Break the silence →
              </LinkButton>
            </div>
          </Card>
        )}

        {posts && posts.length > 0 && (
          <ul className="grid gap-8 sm:grid-cols-2">
            {posts.map((post, i) => {
              const color = cardColors[i % cardColors.length];
              return (
                <li
                  key={post.id}
                  className={`${tilts[i % tilts.length]} transition-transform duration-200 hover:rotate-0 hover:scale-[1.02]`}
                >
                  <Card color={color} className="flex h-full flex-col p-6">
                    <span className="absolute -right-3 -top-4">
                      <Sticker color={i % 2 ? "grape" : "ink"} rotate={8}>
                        #{post.id}
                      </Sticker>
                    </span>
                    <div className="flex items-center gap-3">
                      <Avatar name={post.authorName} size={36} />
                      <div className="text-xs font-bold uppercase tracking-wider">
                        @{post.authorName}
                        <div className="font-normal normal-case tracking-normal opacity-70">
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/posts/${post.id}`}
                      className="mt-4 block font-display text-2xl uppercase leading-tight hover:underline hover:decoration-hot hover:decoration-4 hover:underline-offset-4"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-3 line-clamp-4 flex-1 whitespace-pre-line font-medium leading-relaxed">
                      {post.content}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="border-[3px] border-ink bg-white px-2 py-1 text-xs font-bold shadow-pop">
                        💬 {post.commentCount ?? 0}
                      </span>
                      <LinkButton href={`/posts/${post.id}`} color="ink" size="sm">
                        Read →
                      </LinkButton>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  n,
  label,
  color,
}: {
  n: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className={`${color} border-[3px] border-ink px-2 py-3 shadow-pop`}>
      <div className="font-display text-3xl leading-none">{n}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em]">
        {label}
      </div>
    </div>
  );
}
