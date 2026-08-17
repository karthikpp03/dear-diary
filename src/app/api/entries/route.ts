import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllEntries, insertEntry } from "@/lib/journals";
import { generateJournalEntry } from "@/lib/openai";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const entries = await getAllEntries(supabase);
    return NextResponse.json({ entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const rawMessage: string = (body?.message ?? "").trim();

    if (!rawMessage) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    const generated = await generateJournalEntry(rawMessage);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
    const date = `${formattedDate} — ${weekday}`;

    const entry = await insertEntry(supabase, user.id, {
      date,
      rawMessage,
      journalText: generated.journalText,
      mood: generated.mood,
      energy: generated.energy,
      highlights: generated.highlights,
      reflection: generated.reflection,
      tags: generated.tags,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (err) {
    console.error(err);
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
