"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Blob,
  Button,
  Card,
  ErrorBox,
  Field,
  Sticker,
  inputCls,
} from "@/components/ui";
import { api, type SafeUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ user: SafeUser; token: string }>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        }
      );
      await login(d.user, d.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md">
      <Blob className="-right-28 -top-20 w-64 animate-float" color="#a3ff12" />
      <Blob className="-left-24 bottom-10 w-56 animate-spin-slow" color="#ff6a00" />

      <div className="mb-6 text-center">
        <Sticker color="lime" rotate={5}>
          100% free · forever
        </Sticker>
        <h1 className="mt-4 font-display text-5xl uppercase leading-none text-outline text-grape drop-shadow-[5px_5px_0_#0b0b14]">
          Join the noise
        </h1>
        <p className="mt-3 font-fun text-xl text-hot">
          grab a mic, pick a name ✦
        </p>
      </div>

      <Card color="white" className="p-7">
        <span className="absolute -left-5 -top-5 -rotate-12 text-4xl">🎤</span>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}
          <Field label="Username" id="username" hint="Letters, numbers, underscores. 3–50 chars.">
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9_]+"
              autoComplete="username"
              placeholder="loud_larry"
              className={inputCls}
            />
          </Field>
          <Field label="Email" id="email">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@loud.blog"
              className={inputCls}
            />
          </Field>
          <Field label="Password" id="password" hint="At least 6 characters.">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>
          <Button type="submit" color="grape" size="lg" disabled={busy} className="w-full">
            {busy ? "Creating…" : "Create my account →"}
          </Button>
        </form>
      </Card>

      <p className="mt-8 text-center font-bold">
        Already shouting here?{" "}
        <Link
          href="/login"
          className="bg-sky px-2 py-0.5 underline decoration-[3px] underline-offset-4 hover:bg-lemon"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
