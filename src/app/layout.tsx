import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoudBlog — say it louder",
  description: "A maximalist blogging platform with posts and comments.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <Navbar />
          <main className="relative mx-auto max-w-5xl px-4 py-10">{children}</main>
          <footer className="mt-16 border-t-[3px] border-ink bg-ink px-4 py-8 text-cream">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
              <p className="font-display text-xl uppercase">
                📣 Loud<span className="text-hot">Blog</span>
              </p>
              <p className="font-fun text-lg text-lemon">
                More is more. Always.
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-cream/60">
                Next.js · Postgres · Drizzle
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
