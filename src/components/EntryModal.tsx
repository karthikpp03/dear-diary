"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { JournalEntry } from "@/types/entry";
import { moodColor } from "@/lib/mood";

interface EntryModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

export default function EntryModal({ entry, onClose }: EntryModalProps) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <AnimatePresence
      onExitComplete={() => setShowRaw(false)}
    >
      {entry && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(10, 8, 6, 0.7)" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-hairline)",
              boxShadow: "var(--shadow-lift)",
            }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-7 pt-6 pb-3" style={{ background: "var(--bg-elevated)" }}>
              <p
                className="text-base italic"
                style={{
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {entry.date}
              </p>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{ background: "var(--bg-base-2)", color: "var(--text-secondary)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="px-7 pb-8">
              <p
                className="mb-6 whitespace-pre-wrap text-[1.08rem] leading-[1.85]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-reading)",
                }}
              >
                {entry.journalText}
              </p>

              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: "var(--bg-base-2)",
                    color: moodColor(entry.mood),
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {entry.mood}
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs"
                  style={{
                    background: "var(--bg-base-2)",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  energy {entry.energy}/10
                </span>
              </div>

              {entry.highlights.length > 0 && (
                <div className="mb-6">
                  <p
                    className="mb-2 text-xs tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
                  >
                    Highlights
                  </p>
                  <ul className="space-y-1.5">
                    {entry.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ui)" }}
                      >
                        <span style={{ color: "var(--accent-ember)" }}>&bull;</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.reflection && (
                <div
                  className="mb-6 rounded-2xl px-5 py-4"
                  style={{ background: "var(--bg-base-2)", borderLeft: "2px solid var(--accent-ember)" }}
                >
                  <p
                    className="text-[0.98rem] italic leading-relaxed"
                    style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)" }}
                  >
                    &ldquo;{entry.reflection}&rdquo;
                  </p>
                </div>
              )}

              {entry.tags.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-2.5 py-0.5 text-xs"
                      style={{
                        background: "var(--bg-base-2)",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-ui)",
                      }}
                    >
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowRaw((s) => !s)}
                className="text-xs underline-offset-4 hover:underline"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
              >
                {showRaw ? "Hide what you originally typed" : "See what you originally typed"}
              </button>

              {showRaw && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 rounded-xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: "var(--bg-base-2)",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-ui)",
                  }}
                >
                  {entry.rawMessage}
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
