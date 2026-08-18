"use client";

// src/app/history/page.tsx

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import EntryCard from "@/components/EntryCard";
import EntryModal from "@/components/EntryModal";
import AmbientBackground from "@/components/AmbientBackground";
import type { JournalEntry } from "@/types/entry";

export default function HistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/entries")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Couldn't load your history.");
        }
        if (!cancelled) setEntries(data.entries ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Couldn't load your history."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

      <Link
        href="/"
        className="fixed right-5 top-5 z-40 text-xs tracking-wide underline-offset-4 hover:underline"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
      >
        Back to diary
      </Link>

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
            Your history
          </h1>
        </motion.div>

        {isLoading && (
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            Gathering your entries&hellip;
          </p>
        )}

        {!isLoading && error && (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={{ border: "1px dashed var(--border-hairline)" }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--accent-clay)", fontFamily: "var(--font-ui)" }}
            >
              {error}
            </p>
          </div>
        )}

        {!isLoading && !error && entries.length === 0 && (
          <div
            className="rounded-2xl px-6 py-10 text-center"
            style={{
              border: "1px dashed var(--border-hairline)",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ fontFamily: "var(--font-display)" }} className="italic text-lg mb-1">
              No entries yet.
            </p>
            <p className="text-sm" style={{ fontFamily: "var(--font-ui)" }}>
              Once you write your first entry, it&apos;ll show up here.
            </p>
          </div>
        )}

        {!isLoading && !error && entries.length > 0 && (
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
        )}
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