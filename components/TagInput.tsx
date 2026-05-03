"use client";

import { useMemo, useState } from "react";

export function TagInput({
  value,
  onChange,
  suggestions = [],
}: {
  value: string[];
  onChange: (next: string[]) => void;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const add = (raw: string) => {
    const t = raw.trim().toLowerCase().replace(/^#/, "");
    if (!t || t.length > 30 || value.includes(t) || value.length >= 12) return;
    onChange([...value, t]);
    setInput("");
  };

  const remove = (t: string) => onChange(value.filter((x) => x !== t));

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return suggestions
      .filter((s) => !value.includes(s) && s.includes(q) && s !== q)
      .slice(0, 6);
  }, [input, suggestions, value]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-2 py-1.5 focus-within:border-[rgb(var(--accent))] focus-within:ring-2 focus-within:ring-[rgb(var(--accent))]/40">
        {value.map((t) => (
          <span key={t} className="tag flex items-center gap-1 !bg-[rgb(var(--accent))]/10 !text-[rgb(var(--fg))] !border-[rgb(var(--accent))]/30">
            #{t}
            <button
              type="button"
              onClick={() => remove(t)}
              className="text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))]"
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={value.length === 0 ? "investing, dcf, macro…" : ""}
          className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-[rgb(var(--muted))]"
        />
      </div>
      {focused && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--card))] shadow-lg">
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s)}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
