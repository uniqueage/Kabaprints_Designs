import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentUser } from "@/lib/supabase/auth";
import AdminShell from "./AdminShell";

export const metadata: Metadata = { title: "Admin", robots: "noindex" };
export const dynamic = "force-dynamic";

interface Props {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: Props) {
  const env = getSupabaseEnv();

  if (!env) {
    // Supabase isn't configured — redirect to the public site.
    redirect("/");
  }

  const user = await getCurrentUser();

  if (user?.role === "admin") {
    // Authenticated admin: render the full shell (sidebar + top bar).
    return (
      <AdminShell user={user}>
        <Suspense fallback={null}>{children}</Suspense>
      </AdminShell>
    );
  }

  // Not signed in, or signed in as non-admin: render the children raw.
  // middleware.ts has already redirected every non-sign-in /admin/* page to
  // /admin/sign-in, so this branch only ever renders the sign-in page, which
  // has its own header and form (no shell chrome needed).
  return <>{children}</>;
}
