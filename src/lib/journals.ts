import type { SupabaseClient } from "@supabase/supabase-js";
import type { JournalEntry } from "@/types/entry";

type JournalRow = {
  id: string;
  user_id: string;
  entry_date: string;
  raw_message: string;
  journal: string;
  mood: string;
  energy: number;
  highlights: string[];
  reflection: string;
  tags: string[];
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: JournalRow): JournalEntry {
  return {
    id: row.id,
    date: row.entry_date,
    isoDate: row.created_at.slice(0, 10),
    rawMessage: row.raw_message,
    journalText: row.journal,
    mood: row.mood,
    energy: row.energy,
    highlights: row.highlights ?? [],
    reflection: row.reflection,
    tags: row.tags ?? [],
    createdAt: row.created_at,
  };
}

// RLS scopes every query to the signed-in user automatically (auth.uid() =
// user_id), as long as `supabase` was created with that user's session —
// see src/lib/supabase/server.ts.

export async function getAllEntries(
  supabase: SupabaseClient
): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as JournalRow[]).map(rowToEntry);
}

export async function getEntryById(
  supabase: SupabaseClient,
  id: string
): Promise<JournalEntry | null> {
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToEntry(data as JournalRow) : null;
}

export async function insertEntry(
  supabase: SupabaseClient,
  userId: string,
  entry: {
    date: string;
    rawMessage: string;
    journalText: string;
    mood: string;
    energy: number;
    highlights: string[];
    reflection: string;
    tags: string[];
  }
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from("journals")
    .insert({
      user_id: userId,
      entry_date: entry.date,
      raw_message: entry.rawMessage,
      journal: entry.journalText,
      mood: entry.mood,
      energy: entry.energy,
      highlights: entry.highlights,
      reflection: entry.reflection,
      tags: entry.tags,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToEntry(data as JournalRow);
}
