import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto mt-10 max-w-md">
        <div className="card p-6 text-center">
          <h1 className="text-xl font-semibold">Auth not configured</h1>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Supabase environment variables are not set up yet.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase!.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto mt-10 max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-[rgb(var(--muted))]">
          Anyone can browse. Only allowlisted accounts can add prompts.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
