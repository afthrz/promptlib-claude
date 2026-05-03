"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPrompt } from "@/app/actions";
import { TagInput } from "@/components/TagInput";

export function NewPromptForm({ tagSuggestions }: { tagSuggestions: string[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("body", body);
    fd.set("tags", tags.join(","));
    start(async () => {
      const res = await createPrompt(fd);
      if (res?.error) setError(res.error);
    });
  };

  const valid = title.trim().length > 0 && body.trim().length > 0;

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Title</span>
        <input
          className="input"
          placeholder="e.g. Quarterly earnings deep dive"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Prompt</span>
        <textarea
          className="input min-h-[220px] font-mono text-[13px] leading-relaxed"
          placeholder="Paste the prompt body here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={20000}
          required
        />
        <span className="text-xs text-[rgb(var(--muted))]">{body.length} / 20000</span>
      </label>

      <div className="space-y-1.5">
        <span className="text-sm font-medium">Tags</span>
        <TagInput value={tags} onChange={setTags} suggestions={tagSuggestions} />
        <span className="text-xs text-[rgb(var(--muted))]">
          Press Enter or comma to add. Up to 12 tags.
        </span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Link href="/" className="btn-ghost">Cancel</Link>
        <button
          type="submit"
          disabled={!valid || pending}
          className="btn-primary"
        >
          {pending ? "Publishing…" : "Publish"}
        </button>
      </div>
    </form>
  );
}
