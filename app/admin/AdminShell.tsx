"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/supabase/lib/types";
import Link from "next/link";
import { ArrowLeft, Box, FileText, LogOut, Package, Settings, ShoppingBag } from "@/lib/icons";

interface Props {
  user: Profile;
  children: React.ReactNode;
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/designs", label: "Designs", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ user, children }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/sign-in");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* top bar */}
      <div className="bg-brand-deep text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to site
            </Link>
            <span className="hidden h-6 w-px bg-white/20 sm:block" />
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-white/70 sm:block">
              Kabaprints Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-white/80 sm:block">
              Signed in as {user.display_name ?? user.id.slice(0, 8)}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* sidebar */}
      <aside className="w-[220px] shrink-0 border-r border-silver-light/70 bg-white">
        <div className="sticky top-0 h-full border-b border-silver-light/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <a href="/admin" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-black text-white">
                K
              </span>
              <span className="text-sm font-bold text-ink">Kabaprints</span>
              <span className="text-xs text-muted">Admin</span>
            </a>
          </div>
          <nav className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
            <ul className="space-y-1">
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <li key={n.href}>
                    <a
                      href={n.href}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-brand-light hover:text-brand-dark"
                    >
                      <Icon className="h-4 w-4" />
                      {n.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* content */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
