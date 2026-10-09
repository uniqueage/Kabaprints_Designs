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

  if (!user || user.role !== "admin") {
    const searchParams = new URLSearchParams();
    searchParams.set("next", "/admin");
    redirect(`/admin/sign-in?${searchParams.toString()}`);
  }

  return (
    <AdminShell user={user}>
      <Suspense fallback={null}>{children}</Suspense>
    </AdminShell>
  );
}
