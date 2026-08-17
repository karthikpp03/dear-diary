"use client";

import { motion } from "framer-motion";
import type { JournalEntry } from "@/types/entry";
import { moodColor } from "@/lib/mood";

interface EntryCardProps {
  entry: JournalEntry;
  onClick: () => void;
  index: number;
}

export default function EntryCard({ entry, onClick, index }: EntryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4) }}
      whileHover={{ y: -3 }}
      className="group relative w-full overflow-hidden rounded-2xl px-6 py-5 text-left transition-colors duration-300"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-hairline-soft)",
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: moodColor(entry.mood) }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="mb-1.5 text-sm italic"
            style={{
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {entry.date}
          </p>
          <p
            className="line-clamp-2 text-[0.98rem] leading-relaxed"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-reading)",
            }}
          >
            {entry.journalText}
          </p>

          {entry.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {entry.tags.slice(0, 4).map((tag) => (
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
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
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
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            energy {entry.energy}/10
          </span>
        </div>
      </div>
    </motion.button>
  );
}
