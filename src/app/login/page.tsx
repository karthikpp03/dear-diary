"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AmbientBackground from "@/components/AmbientBackground";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(
          "Account created. If email confirmation is on, check your inbox — otherwise you're signed in, just head back in."
        );
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden px-5">
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <p
            className="mb-3 text-xs tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
          >
            Dear Diary
          </p>
          <h1
            className="text-3xl italic"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            {mode === "signin" ? "Welcome back" : "Start your diary"}
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl px-6 py-7"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-hairline)",
            boxShadow: "var(--shadow-soft)",
          }}
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs tracking-wide uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--bg-base-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-hairline-soft)",
                fontFamily: "var(--font-ui)",
              }}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs tracking-wide uppercase"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--bg-base-2)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-hairline-soft)",
                fontFamily: "var(--font-ui)",
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-ember), var(--accent-clay))",
              color: "#17130f",
              fontFamily: "var(--font-ui)",
            }}
          >
            {isSubmitting
              ? "Please wait…"
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </motion.button>

          {error && (
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--accent-clay)", fontFamily: "var(--font-ui)" }}
            >
              {error}
            </p>
          )}
          {message && (
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--accent-moss)", fontFamily: "var(--font-ui)" }}
            >
              {message}
            </p>
          )}
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-5 w-full text-center text-sm underline-offset-4 hover:underline"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-ui)" }}
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </main>
  );
}
