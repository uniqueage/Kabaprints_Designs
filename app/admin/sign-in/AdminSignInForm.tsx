"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // The browser client set the session cookie; reload so the middleware +
      // server layout pick up the new session.
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-coral-light border border-coral/30 p-3 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="admin-email" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
          Email address
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@kabaprints.com"
          className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="admin-password" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full rounded-full bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-xs text-muted">
        By signing in you agree to use this panel responsibly. All changes are logged in Supabase.
      </p>
    </form>
  );
}
