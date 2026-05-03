import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let canAdd = false;
  if (user?.email) {
    const { data } = await supabase
      .from("allowed_authors")
      .select("email")
      .ilike("email", user.email)
      .maybeSingle();
    canAdd = !!data;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgb(var(--accent))] text-[rgb(var(--accent-fg))] text-sm">P</span>
          <span>Prompt Library</span>
        </Link>
        <nav className="flex items-center gap-2">
          {canAdd && (
            <Link href="/new" className="btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              New prompt
            </Link>
          )}
          {user ? (
            <form action={signOut}>
              <button className="btn-ghost text-[rgb(var(--muted))]" title={user.email ?? ""}>
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn-outline">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
