"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/supabase/lib/types";
import { ArrowLeft, Box, FileText, LogOut, Package, Settings, ShoppingBag } from "@/lib/icons";
import { COLLECTIONS } from "./content/collections";

interface Props {
  user: Profile;
  children: React.ReactNode;
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/designs", label: "Designs", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ user, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/sign-in");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const onContent = pathname.startsWith("/admin/content");

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* top bar */}
      <div className="bg-brand-deep text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
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

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* sidebar */}
        <aside className="w-full shrink-0 border-b border-silver-light/70 bg-white lg:w-[248px] lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-0">
            <Link href="/admin" className="flex items-center gap-2.5 border-b border-silver-light/60 px-4 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-xs font-black text-white">
                K
              </span>
              <span className="text-sm font-bold text-ink">Kabaprints</span>
              <span className="text-xs text-muted">Admin</span>
            </Link>

            <nav aria-label="Admin sections" className="overflow-x-auto p-3 lg:overflow-visible">
              <ul className="flex gap-1 lg:flex-col">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href} className="shrink-0 lg:shrink">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                          active
                            ? "bg-brand-light text-brand-dark"
                            : "text-ink-soft hover:bg-brand-light hover:text-brand-dark"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {onContent && (
                <div className="mt-3 hidden border-t border-silver-light/60 pt-3 lg:block">
                  <p className="px-3 pb-1 text-[10px] font-black uppercase tracking-widest text-muted">
                    Edit content
                  </p>
                  <ul className="space-y-0.5">
                    {COLLECTIONS.map((c) => {
                      const href = `/admin/content/${c.slug}`;
                      const active = pathname === href;
                      return (
                        <li key={c.slug}>
                          <Link
                            href={href}
                            aria-current={active ? "page" : undefined}
                            className={`block rounded-lg px-3 py-1.5 text-[13px] transition ${
                              active
                                ? "bg-cream font-bold text-brand-dark"
                                : "font-medium text-muted hover:bg-cream hover:text-ink"
                            }`}
                          >
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* content */}
        <main className="flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
