/**
 * Migrates existing entries from the old local data/journal.db (SQLite)
 * into Supabase. Safe to run more than once — already-migrated rows are
 * skipped by checking raw_message + created_at as a rough fingerprint.
 *
 * This does NOT delete or modify data/journal.db.
 *
 * Usage:
 *   1. Make sure data/journal.db still exists (from the old local version).
 *   2. Set these in your environment (e.g. a .env.local the script loads):
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...   (service role — server-only, never in the browser)
 *        MIGRATION_USER_ID=<the Supabase auth user id to attach these entries to>
 *   3. Run:
 *        npm run migrate:supabase
 *
 *   Find a user's id in the Supabase dashboard under Authentication > Users,
 *   or by signing in once in the app and checking `auth.users`.
 */

import "dotenv/config";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATION_USER_ID = process.env.MIGRATION_USER_ID;

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment."
    );
    process.exit(1);
  }
  if (!MIGRATION_USER_ID) {
    console.error(
      "Missing MIGRATION_USER_ID — set it to the Supabase auth user id that should own these entries."
    );
    process.exit(1);
  }

  const dbPath = path.join(process.cwd(), "data", "journal.db");
  if (!fs.existsSync(dbPath)) {
    console.log("No data/journal.db found — nothing to migrate.");
    return;
  }

  const sqlite = new Database(dbPath, { readonly: true });
  const rows = sqlite
    .prepare("SELECT * FROM entries ORDER BY createdAt ASC")
    .all() as Array<{
    date: string;
    rawMessage: string;
    journalText: string;
    mood: string;
    energy: number;
    highlights: string;
    reflection: string;
    tags: string;
    createdAt: string;
  }>;

  if (rows.length === 0) {
    console.log("data/journal.db has no entries — nothing to migrate.");
    return;
  }

  // Service role key bypasses RLS — this script must only ever be run
  // locally/manually, never shipped to the client.
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: existing, error: fetchError } = await supabase
    .from("journals")
    .select("raw_message, created_at")
    .eq("user_id", MIGRATION_USER_ID);

  if (fetchError) {
    console.error("Could not check existing Supabase rows:", fetchError.message);
    process.exit(1);
  }

  const alreadyMigrated = new Set(
    (existing ?? []).map((r) => `${r.raw_message}::${r.created_at}`)
  );

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    const fingerprint = `${row.rawMessage}::${row.createdAt}`;
    if (alreadyMigrated.has(fingerprint)) {
      skipped++;
      continue;
    }

    const { error: insertError } = await supabase.from("journals").insert({
      user_id: MIGRATION_USER_ID,
      entry_date: row.date,
      raw_message: row.rawMessage,
      journal: row.journalText,
      mood: row.mood,
      energy: row.energy,
      highlights: JSON.parse(row.highlights),
      reflection: row.reflection,
      tags: JSON.parse(row.tags),
      created_at: row.createdAt,
    });

    if (insertError) {
      console.error(`Failed to migrate an entry from ${row.createdAt}:`, insertError.message);
      continue;
    }
    migrated++;
  }

  console.log(`Done. Migrated ${migrated} entries, skipped ${skipped} already-migrated.`);
}

main();
