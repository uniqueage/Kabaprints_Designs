"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/data";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [signedIn, setSignedIn] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    if (Object.keys(next).length === 0) setSignedIn(true);
  }

  if (signedIn) {
    return (
      <div className="animate-fade-up rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-brand/15">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-7 w-7" aria-hidden="true"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h2 className="mt-5 text-2xl font-black text-ink">Welcome back!</h2>
        <p className="mt-2 text-sm text-muted">
          You are signed in for this session. Account sessions are handled on the client in this release —
          connect your auth provider to persist them.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/quote" className="rounded-full bg-coral px-6 py-3 text-sm font-black text-white transition hover:bg-coral-dark">Start a quote</Link>
          <Link href="/" className="rounded-full border border-silver-light px-6 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand">Back home</Link>
        </div>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-silver-light bg-cream px-4 py-3.5 text-sm focus:border-brand focus:bg-white focus:outline-none";

  return (
    <form onSubmit={submit} noValidate className="rounded-3xl bg-white p-7 shadow-xl ring-1 ring-silver-light sm:p-9">
      <div className="space-y-4">
        <div>
          <label htmlFor="si-email" className="block text-xs font-black uppercase tracking-widest text-brand-dark">Email address</label>
          <input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} placeholder="you@company.com" className={`${field} mt-1.5`} aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="si-password" className="block text-xs font-black uppercase tracking-widest text-brand-dark">Password</label>
          <div className="relative mt-1.5">
            <input id="si-password" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: undefined })); }} placeholder="••••••••" className={`${field} pr-16`} aria-invalid={!!errors.password} />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand hover:underline">
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.password}</p>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" className="h-4 w-4 rounded border-silver-light accent-brand" />
          Remember me
        </label>
        <a href={`mailto:${SITE.email}?subject=Password%20reset`} className="font-bold text-brand hover:underline">Forgot password?</a>
      </div>

      <button type="submit" className="mt-6 w-full rounded-full bg-brand px-6 py-3.5 text-sm font-black text-white transition hover:bg-brand-dark">
        Sign In
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        New to Kabaprints? <Link href="/quote" className="font-bold text-coral hover:underline">Request a quote</Link> — no account needed to order.
      </p>
    </form>
  );
}
