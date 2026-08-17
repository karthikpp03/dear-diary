"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Composer from "@/components/Composer";
import EntryCard from "@/components/EntryCard";
import EntryModal from "@/components/EntryModal";
import AmbientBackground from "@/components/AmbientBackground";
import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/types/entry";

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data) => setEntries(data.entries ?? []))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (message: string) => {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? "Something went wrong.");
    }
    setEntries((prev) => [data.entry, ...prev]);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleEntryUpdated = (updated: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelected(updated);
  };

  const handleEntryDeleted = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected(null);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />

      <div className="fixed right-5 top-5 z-40 flex items-center gap-4">
        <Link
          href="/history"
          className="text-xs tracking-wide underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
        >
          History
        </Link>
        <button
          onClick={handleSignOut}
          className="text-xs tracking-wide underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
        >
          Sign out
        </button>
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col px-5 pb-24 pt-16 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-14"
        >
          <p
            className="mb-3 text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            Dear Diary
          </p>
          <h1
            className="text-[2.1rem] italic leading-tight sm:text-5xl"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            How was your day?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Composer onSubmit={handleSubmit} />
        </motion.div>

        <div className="mt-16">
          {!isLoading && entries.length > 0 && (
            <p
              className="mb-4 text-xs tracking-[0.2em] uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
            >
              Recent entries
            </p>
          )}

          {isLoading && (
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
            >
              Opening your diary&hellip;
            </p>
          )}

          {!isLoading && entries.length === 0 && (
            <div
              className="rounded-2xl px-6 py-10 text-center"
              style={{
                border: "1px dashed var(--border-hairline)",
                color: "var(--text-muted)",
              }}
            >
              <p style={{ fontFamily: "var(--font-display)" }} className="italic text-lg mb-1">
                Nothing here yet.
              </p>
              <p className="text-sm" style={{ fontFamily: "var(--font-ui)" }}>
                Tell it how today went &mdash; that&apos;s all it takes to start.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={i}
                onClick={() => setSelected(entry)}
              />
            ))}
          </div>
        </div>
      </div>

      <EntryModal
        entry={selected}
        onClose={() => setSelected(null)}
        onUpdated={handleEntryUpdated}
        onDeleted={handleEntryDeleted}
      />
    </main>
  );
}