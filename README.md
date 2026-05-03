# Prompt Library

A small, fast prompt-sharing site for you and your friends. Anyone can browse,
allowlisted accounts can add prompts. Built with Next.js + Supabase + Tailwind.

## 1. Create a Supabase project

1. Go to https://supabase.com → New project (free tier is fine).
2. Project Settings → **API** → copy:
   - `Project URL`
   - `anon` `public` key

## 2. Run the schema

Supabase Dashboard → **SQL Editor** → paste the contents of
[`supabase/schema.sql`](supabase/schema.sql) and click **Run**.

## 3. Add yourself (and friends) to the allowlist

Same SQL editor:

```sql
insert into allowed_authors (email) values
  ('alfathariz@gmail.com'),
  ('friend@example.com')
on conflict do nothing;
```

Add more later anytime.

## 4. Configure auth providers

Authentication → **Providers**:
- **Email**: enabled by default — magic link works out of the box.
- **Google**: enable, add OAuth client ID/secret from Google Cloud Console.
  Authorized redirect URI = `https://YOUR-PROJECT.supabase.co/auth/v1/callback`.

Authentication → **URL Configuration** → set **Site URL** to your deployed URL
(e.g. `https://prompts.yourdomain.com`) and add `http://localhost:3000` under
**Redirect URLs** for local dev.

## 5. Local env

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 6. Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 7. Deploy

### Vercel (recommended)
1. Push this folder to a GitHub repo.
2. vercel.com → Import Project → set the same three env vars.
3. After first deploy, set `NEXT_PUBLIC_SITE_URL` to the production URL and
   add it to Supabase **Redirect URLs**.

### Netlify
Same flow — Netlify auto-detects Next.js. Add the env vars in Site settings.

## How it works

- **Public read, gated write.** Postgres row-level security: anyone (anon key)
  can `select` from `prompts`; only emails in `allowed_authors` can `insert`.
- **No backend code.** Auth, DB, and policies live in Supabase. The Next.js
  app uses `@supabase/ssr` so cookies work in Server Components.
- **Free-form tags** stored as a `text[]` with a GIN index for fast filtering.
