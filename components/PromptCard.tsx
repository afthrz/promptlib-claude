"use client";

import { useState, useTransition } from "react";
import { deletePrompt } from "@/app/actions";

type Prompt = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author_email: string;
  created_at: string;
};

export function PromptCard({
  prompt,
  ownedByMe,
}: {
  prompt: Prompt;
  ownedByMe: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pending, start] = useTransition();

  const copy = async () => {
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onDelete = () => {
    if (!confirm("Delete this prompt?")) return;
    start(() => {
      deletePrompt(prompt.id);
    });
  };

  const truncated = prompt.body.length > 280 && !expanded;
  const display = truncated ? prompt.body.slice(0, 280) + "…" : prompt.body;
  const author = prompt.author_email.split("@")[0];

  return (
    <li className="card flex flex-col gap-3 p-4 transition hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-snug">{prompt.title}</h3>
        <button
          onClick={copy}
          className="btn-ghost shrink-0 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
          title="Copy prompt"
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-[rgb(var(--fg))]/90">
        {display}
      </pre>
      {prompt.body.length > 280 && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="self-start text-xs text-[rgb(var(--muted))] hover:underline"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((t) => (
            <span key={t} className="tag">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-1 flex items-center justify-between text-xs text-[rgb(var(--muted))]">
        <span>by {author}</span>
        <div className="flex items-center gap-3">
          <time dateTime={prompt.created_at}>
            {new Date(prompt.created_at).toLocaleDateString()}
          </time>
          {ownedByMe && (
            <button
              onClick={onDelete}
              disabled={pending}
              className="hover:text-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
