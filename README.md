# Dear Diary

A quiet, personal AI journal. Type your day the way you'd actually say it —
Tanglish, slang, broken English, whatever — and it becomes a real journal
entry: mood, energy, highlights, a short reflection, and tags. Signed-in,
cloud-persistent, and available on any device.

## Stack

- **Next.js (App Router) + TypeScript** — frontend and API together
- **Tailwind CSS v4** + **Framer Motion** — the existing UI, unchanged
- **Supabase** — Postgres database + authentication + Row Level Security
- **OpenAI API** (`gpt-4o-mini` by default) — turns your raw message into the structured entry

## 1. Create a Supabase project

1. Go to https://supabase.com, create a new project.
2. Open the **SQL Editor** and run everything in `supabase/schema.sql` — this
   creates the `journals` table, turns on Row Level Security, and adds
   policies so a user can only ever read/write their own rows.
3. Go to **Settings > API** and copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (only needed later, for the one-off migration script — never used by the running app)
4. Go to **Authentication > Providers** and make sure **Email** is enabled
   (it is by default). Email confirmation is on by default too — turn it off
   in **Authentication > Settings** if you'd rather sign-up log people in
   immediately without a confirmation email, especially while testing locally.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # only used by the migration script
```

The `NEXT_PUBLIC_*` variables are safe to expose to the browser — Supabase's
Row Level Security is what actually protects the data, not secrecy of that
key. The `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only and
are never sent to the client.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you'll land on `/login` first. Create an
account, then you're in.

## 4. Migrating old local SQLite data (optional)

If you have an old `data/journal.db` from before this change, you can move
those entries into Supabase without losing anything:

1. Sign up / log in once in the app so a Supabase user exists.
2. Find that user's id in the Supabase dashboard under **Authentication > Users**.
3. Add to `.env.local`:
   ```
   MIGRATION_USER_ID=<that user id>
   ```
4. Run:
   ```bash
   npm run migrate:supabase
   ```

This only reads `data/journal.db` — it's never deleted or modified, and the
script can be re-run safely (already-migrated entries are skipped).

## 5. Deploying (GitHub → Vercel → Supabase)

1. Push this project to a GitHub repo.
2. Import it into Vercel.
3. In the Vercel project's **Environment Variables**, add the same four
   variables from `.env.local` (skip `SUPABASE_SERVICE_ROLE_KEY` unless you
   plan to run the migration script from a server context — it's not needed
   for the app itself to run).
4. Deploy. The app has no dependency on the local filesystem, so it works
   the same on Vercel as it does locally — sign in from any device, and your
   entries follow you.

## Project structure

```
src/
  app/
    page.tsx                   # main page — hero, composer, entry list (unchanged UI + a sign-out link)
    login/page.tsx              # minimal sign in / sign up page
    layout.tsx                  # fonts + metadata (unchanged)
    globals.css                 # design tokens (unchanged)
    api/entries/route.ts        # GET (list) / POST (create + generate) — now Supabase + auth-checked
    api/entries/[id]/route.ts   # GET single entry — Supabase + auth-checked
  components/                   # unchanged — Composer, EntryCard, EntryModal, AmbientBackground
  lib/
    supabase/client.ts          # browser Supabase client
    supabase/server.ts          # server Supabase client (Route Handlers)
    supabase/middleware.ts      # session refresh + route protection logic
    journals.ts                 # Supabase queries (replaces the old sqlite db.ts)
    openai.ts                   # prompt + structured-output call to OpenAI (unchanged)
    mood.ts                     # unchanged
  types/entry.ts                 # shared types (id is now a Supabase uuid string)
  proxy.ts                       # Next.js 16 proxy (formerly "middleware") — auth gate
supabase/schema.sql               # run this once in the Supabase SQL editor
scripts/migrate-sqlite-to-supabase.ts  # one-off local data migration
```

## Notes

- The AI is instructed to never invent events — it only rewrites what you
  actually said, and keeps short messages short. Unchanged from before.
- Both the raw message and the generated entry are stored, so nothing is lost.
- Row Level Security means even a leaked anon key can't expose another
  user's journals — every query is scoped to `auth.uid()`.
- The old local SQLite path (`data/journal.db`, `src/lib/db.ts`) has been
  replaced by Supabase and is no longer used at runtime. `better-sqlite3` is
  kept only as a dev dependency for the migration script.
