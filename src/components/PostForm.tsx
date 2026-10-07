"use client";

import { useState, type FormEvent } from "react";
import { Button, ErrorBox, Field, inputCls } from "./ui";

type Props = {
  initialTitle?: string;
  initialContent?: string;
  submitLabel: string;
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
};

export function PostForm({
  initialTitle = "",
  initialContent = "",
  submitLabel,
  onSubmit,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await onSubmit({ title, content });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorBox>{error}</ErrorBox>}
      <Field label="Headline" id="title" hint={`${title.length}/200`}>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
          className={`${inputCls} font-display text-xl uppercase`}
          placeholder="SOMETHING WORTH SHOUTING"
        />
      </Field>
      <Field
        label="Body"
        id="content"
        hint={`${words} word${words === 1 ? "" : "s"} · line breaks are kept`}
      >
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={14}
          className={`${inputCls} leading-relaxed`}
          placeholder="Go on. Tell us everything…"
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" color="hot" size="lg" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        <span className="font-fun text-lg text-grape">no takebacks (jk, you can edit)</span>
      </div>
    </form>
  );
}
