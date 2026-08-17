"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface ComposerProps {
  onSubmit: (message: string) => Promise<void>;
}

export default function Composer({ onSubmit }: ComposerProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
    }
  };

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setValue("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't save that. Try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full">
      <p
        className="mb-3 text-xs tracking-[0.2em] uppercase"
        style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
      >
        {today}
      </p>

      <div
        className="relative rounded-3xl transition-shadow duration-300"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-hairline)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type like you'd tell a friend&hellip; office la eppadi irundhuchu, evening enna pannina&mdash;anything."
          rows={2}
          disabled={isSubmitting}
          className="w-full resize-none bg-transparent px-6 pt-5 pb-16 text-[1.05rem] leading-relaxed outline-none placeholder:text-[var(--text-muted)]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-reading)",
          }}
        />

        <div className="absolute bottom-3 left-6 right-4 flex items-center justify-between">
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            {value.trim().length > 0 ? "⌘ + Enter to save" : ""}
          </span>

          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isSubmitting}
            whileHover={value.trim() ? { scale: 1.05 } : {}}
            whileTap={value.trim() ? { scale: 0.95 } : {}}
            className="flex h-11 w-11 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-ember), var(--accent-clay))",
              boxShadow: "0 6px 20px -6px rgba(232, 170, 76, 0.5)",
            }}
            aria-label="Save entry"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#17130f] border-t-transparent" />
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#17130f"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm" style={{ color: "var(--accent-clay)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
