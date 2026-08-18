// src/app/api/entries/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteEntry, getEntryById, updateEntryJournalText } from "@/lib/journals";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const entry = await getEntryById(supabase, id);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ entry });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json().catch(() => null);
    const journalText =
      typeof body?.journalText === "string" ? body.journalText.trim() : "";

    if (!journalText) {
      return NextResponse.json(
        { error: "Journal entry can't be empty." },
        { status: 400 }
      );
    }

    // RLS scopes this to rows owned by `user` — see updateEntryJournalText.
    const entry = await updateEntryJournalText(supabase, id, journalText);
    if (!entry) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ entry });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { id } = await params;

  try {
    // RLS scopes this to rows owned by `user` — see deleteEntry.
    const deleted = await deleteEntry(supabase, id);
    if (!deleted) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}