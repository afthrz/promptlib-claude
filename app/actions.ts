"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function parseTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 30)
    )
  ).slice(0, 12);
}

export async function createPrompt(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const tags = parseTags(String(formData.get("tags") ?? ""));

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  const { error } = await supabase.from("prompts").insert({
    title,
    body,
    tags,
    author_id: user.id,
    author_email: user.email,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  redirect("/");
}

export async function deletePrompt(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("prompts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
}
