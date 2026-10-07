"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const colorMap = {
  hot: "bg-hot text-white",
  lemon: "bg-lemon text-ink",
  lime: "bg-lime text-ink",
  sky: "bg-sky text-ink",
  grape: "bg-grape text-white",
  tangerine: "bg-tangerine text-ink",
  ink: "bg-ink text-lemon",
  white: "bg-white text-ink",
} as const;

export type Color = keyof typeof colorMap;

const base =
  "inline-flex items-center justify-center gap-2 border-[3px] border-ink font-display uppercase tracking-wide shadow-pop transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-pop";

export function Button({
  color = "hot",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  color?: Color;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
        ? "px-7 py-4 text-lg"
        : "px-5 py-2.5 text-sm";
  return (
    <button className={`${base} ${colorMap[color]} ${sz} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  color = "hot",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  color?: Color;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  const sz =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : size === "lg"
        ? "px-7 py-4 text-lg"
        : "px-5 py-2.5 text-sm";
  return (
    <Link href={href} className={`${base} ${colorMap[color]} ${sz} ${className}`}>
      {children}
    </Link>
  );
}

export function Sticker({
  color = "lemon",
  rotate = -6,
  className = "",
  children,
}: {
  color?: Color;
  rotate?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`inline-block border-[3px] border-ink px-3 py-1 font-display text-xs uppercase tracking-widest shadow-pop ${colorMap[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Card({
  color = "white",
  className = "",
  children,
}: {
  color?: Color;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative border-[3px] border-ink shadow-pop-lg ${colorMap[color]} ${className}`}
    >
      {children}
    </div>
  );
}

export function Marquee({
  items,
  color = "ink",
}: {
  items: string[];
  color?: Color;
}) {
  const row = [...items, ...items];
  return (
    <div
      className={`overflow-hidden border-y-[3px] border-ink py-2 ${colorMap[color]}`}
    >
      <div className="flex w-max animate-marquee whitespace-nowrap font-display text-sm uppercase tracking-[0.3em]">
        {row.map((t, i) => (
          <span key={i} className="mx-6">
            {t} <span className="mx-3">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-display text-xs uppercase tracking-widest"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  );
}

export const inputCls =
  "w-full border-[3px] border-ink bg-white px-4 py-3 text-ink shadow-pop outline-none transition-all placeholder:text-ink/40 focus:-translate-x-0.5 focus:-translate-y-0.5 focus:bg-lemon/30 focus:shadow-pop-hot";

export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div className="border-[3px] border-ink bg-hot px-4 py-3 font-bold text-white shadow-pop">
      ⚠️ {children}
    </div>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 font-display text-lg uppercase">
      <span className="inline-block h-5 w-5 animate-spin border-[3px] border-ink border-t-hot" />
      {label}
      <span className="animate-blink">_</span>
    </div>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const palette = ["#ff2e88", "#ffe600", "#a3ff12", "#19c7ff", "#7b2cff", "#ff6a00"];
  const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
  return (
    <span
      style={{ width: size, height: size, background: palette[idx], fontSize: size * 0.45 }}
      className="inline-flex shrink-0 items-center justify-center border-[3px] border-ink font-display uppercase text-ink shadow-pop"
    >
      {name[0]}
    </span>
  );
}

export function Blob({
  className = "",
  color = "#ff2e88",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none absolute -z-10 ${className}`}
      aria-hidden
    >
      <path
        fill={color}
        stroke="#0b0b14"
        strokeWidth="4"
        d="M44.7,-65.4C57.6,-56.7,67.5,-43.5,73.6,-28.5C79.7,-13.5,82,3.3,77.3,17.9C72.6,32.5,61,44.8,47.6,54.6C34.3,64.4,19.2,71.7,2.6,68.3C-14,64.9,-28,50.8,-41.7,38.9C-55.4,27,-68.8,17.3,-73.1,4.1C-77.4,-9.1,-72.5,-25.9,-62.4,-37.9C-52.3,-49.9,-37,-57.1,-22.6,-64.6C-8.2,-72.1,5.3,-79.9,19.6,-78.8C33.9,-77.7,47.9,-67.7,44.7,-65.4Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}
