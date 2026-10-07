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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ user: SafeUser; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await login(d.user, d.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-md">
      <Blob className="-left-28 -top-16 w-64 animate-float" color="#19c7ff" />
      <Blob className="-right-24 bottom-0 w-56 animate-spin-slow" color="#ffe600" />

      <div className="mb-6 text-center">
        <Sticker color="sky" rotate={-4}>
          Welcome back
        </Sticker>
        <h1 className="mt-4 font-display text-5xl uppercase leading-none text-outline text-hot drop-shadow-[5px_5px_0_#0b0b14]">
          Log in
        </h1>
        <p className="mt-3 font-fun text-xl text-grape">
          your soapbox awaits ✦
        </p>
      </div>

      <Card color="white" className="p-7">
        <span className="absolute -right-4 -top-5 rotate-12 text-4xl">🔑</span>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <ErrorBox>{error}</ErrorBox>}
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
          <Field label="Password" id="password">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputCls}
            />
          </Field>
          <Button type="submit" color="hot" size="lg" disabled={busy} className="w-full">
            {busy ? "Logging in…" : "Let me in →"}
          </Button>
        </form>
      </Card>

      <p className="mt-8 text-center font-bold">
        New here?{" "}
        <Link
          href="/register"
          className="bg-lime px-2 py-0.5 underline decoration-[3px] underline-offset-4 hover:bg-lemon"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
