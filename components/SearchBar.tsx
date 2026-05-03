"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchBar({
  tags,
  activeTag,
  q,
}: {
  tags: string[];
  activeTag: string;
  q: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(q);

  useEffect(() => setValue(q), [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set("q", value);
      else sp.delete("q");
      router.replace(`/?${sp.toString()}`, { scroll: false });
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const tagHref = (t: string) => {
    const sp = new URLSearchParams(params.toString());
    if (activeTag === t) sp.delete("tag");
    else sp.set("tag", t);
    return `/?${sp.toString()}`;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          className="input pl-9"
          placeholder="Search title, body, or tags…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <Link
              key={t}
              href={tagHref(t)}
              scroll={false}
              className={`tag hover:opacity-80 ${activeTag === t ? "tag-active" : ""}`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
