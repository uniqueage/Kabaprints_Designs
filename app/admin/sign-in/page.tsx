import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentSession, getCurrentUser } from "@/lib/supabase/auth";
import AdminSignInForm from "./AdminSignInForm";

export const metadata: Metadata = { title: "Admin sign in · Kabaprints" };

export default async function AdminSignInPage() {
  // If already signed in as admin, send them straight to the dashboard.
  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* minimal header */}
      <header className="border-b border-silver-light/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-black text-white">
              K
            </span>
            <span className="text-sm font-bold text-ink">Kabaprints</span>
          </Link>
          <span className="text-sm text-muted">Admin panel</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Staff access</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Admin sign in
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Sign in with your Kabaprints staff account to manage orders, products and settings.
            </p>
          </div>

          <Suspense fallback={<FormSkeleton />}>
            <AdminSignInForm />
          </Suspense>

          <p className="mt-6 text-center text-xs text-muted">
            Need access? Contact the account owner to set up your staff account and admin role.
          </p>
        </div>
      </main>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-11 rounded-xl bg-silver-light/60 animate-pulse" />
      ))}
    </div>
  );
}
