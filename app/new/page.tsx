import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { NewPromptForm } from "./NewPromptForm";

export const dynamic = "force-dynamic";

export default async function NewPromptPage() {
  if (!isSupabaseConfigured) redirect("/");

  const supabase = await createClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (!user?.email) redirect("/login");

  const { data: allowed } = await supabase!
    .from("allowed_authors")
    .select("email")
    .ilike("email", user.email)
    .maybeSingle();

  if (!allowed) {
    return (
      <div className="mx-auto mt-10 max-w-md">
        <div className="card p-6 text-center">
          <h1 className="text-xl font-semibold">Not on the allowlist</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Your account ({user.email}) isn&apos;t allowed to add prompts. Ask the
            admin to add your email.
          </p>
          <Link href="/" className="btn-outline mt-4 inline-flex">Back to library</Link>
        </div>
      </div>
    );
  }

  const { data: existing } = await supabase!.from("prompts").select("tags");
  const tagSuggestions = Array.from(
    new Set((existing ?? []).flatMap((r: { tags: string[] }) => r.tags))
  ).sort();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New prompt</h1>
        <p className="text-sm text-[rgb(var(--muted))]">
          Share a reusable prompt with the group.
        </p>
      </div>
      <NewPromptForm tagSuggestions={tagSuggestions} />
    </div>
  );
}
