"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Avatar, Button, LinkButton, Marquee } from "./ui";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="relative z-20">
      <Marquee
        color="ink"
        items={[
          "LOUD BLOG",
          "Write it big",
          "Say it louder",
          "Hot takes welcome",
          "Comments are open",
          "Zero chill",
        ]}
      />
      <div className="border-b-[3px] border-ink bg-lemon">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="inline-flex h-12 w-12 animate-wiggle items-center justify-center border-[3px] border-ink bg-hot text-2xl shadow-pop transition group-hover:bg-grape">
              📣
            </span>
            <span className="font-display text-3xl uppercase leading-none tracking-tight text-outline text-lemon drop-shadow-[3px_3px_0_#0b0b14] sm:text-4xl">
              Loud<span className="text-hot">Blog</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-3">
            {loading ? (
              <span className="font-display text-xs uppercase">
                …<span className="animate-blink">_</span>
              </span>
            ) : user ? (
              <>
                <LinkButton href="/posts/new" color="hot" size="sm">
                  ✚ New Post
                </LinkButton>
                <span className="inline-flex items-center gap-2 border-[3px] border-ink bg-white px-2 py-1 shadow-pop">
                  <Avatar name={user.username} size={26} />
                  <span className="font-bold">@{user.username}</span>
                </span>
                <Button color="white" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <LinkButton href="/login" color="white" size="sm">
                  Login
                </LinkButton>
                <LinkButton href="/register" color="grape" size="sm">
                  Join free →
                </LinkButton>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
