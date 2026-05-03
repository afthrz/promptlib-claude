import { createClient } from "@/lib/supabase/server";
import { PromptCard } from "@/components/PromptCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

type Prompt = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author_id: string;
  author_email: string;
  created_at: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const supabase = await createClient();
  const sp = await searchParams;

  let all: Prompt[] = [];
  let userId: string | undefined;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
    const { data } = await supabase
      .from("prompts")
      .select("*")
      .order("created_at", { ascending: false });
    all = (data ?? []) as Prompt[];
  }

  const q = (sp.q ?? "").toLowerCase().trim();
  const tag = (sp.tag ?? "").toLowerCase().trim();

  const filtered = all.filter((p) => {
    if (tag && !p.tags.includes(tag)) return false;
    if (q) {
      const hay = `${p.title}\n${p.body}\n${p.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const allTags = Array.from(new Set(all.flatMap((p) => p.tags))).sort();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Prompt Library</h1>
        <p className="text-[rgb(var(--muted))]">
          A shared collection of investing & AI prompts. Browse, copy, and reuse.
        </p>
      </section>

      <SearchBar tags={allTags} activeTag={tag} q={sp.q ?? ""} />

      {filtered.length === 0 ? (
        <div className="card p-8 text-center text-[rgb(var(--muted))]">
          {all.length === 0
            ? "No prompts yet. Sign in (if you're on the allowlist) to add the first one."
            : "No prompts match your search."}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <PromptCard key={p.id} prompt={p} ownedByMe={userId === p.author_id} />
          ))}
        </ul>
      )}
    </div>
  );
}
