"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Logo from "./Logo";
import { SITE, services } from "@/lib/data";

type MenuKind = "services" | "mobile";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/design", label: "Need a Design?" },
  { href: "/upload", label: "Upload Design" },
  { href: "/contact", label: "Contact" },
];

function SearchForm({ autoFocus = false, onSubmit }: { autoFocus?: boolean; onSubmit?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        onSubmit?.();
      }}
      className="flex w-full items-center"
    >
      <label htmlFor="site-search" className="sr-only">Search Kabaprints</label>
      <div className="relative flex w-full items-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id="site-search"
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search services, prints…"
          className="w-full rounded-full border border-silver-light bg-cream py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:bg-white focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="ml-2 hidden shrink-0 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark sm:block"
      >
        Search
      </button>
    </form>
  );
}

export default function Header() {
  const pathname = usePathname();
  // Menu visibility is derived from the pathname: when navigation happens the
  // stored path no longer matches and menus close automatically (no effects).
  const [menu, setMenu] = useState<{ path: string; kind: MenuKind } | null>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const isOpen = (kind: MenuKind) => menu?.kind === kind && menu.path === pathname;
  const open = (kind: MenuKind) => setMenu({ path: pathname, kind });
  const toggle = (kind: MenuKind) =>
    setMenu((m) => (m && m.kind === kind && m.path === pathname ? null : { path: pathname, kind }));
  const closeServices = () => setMenu((m) => (m?.kind === "services" ? null : m));

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const servicesActive = pathname.startsWith("/services");

  return (
    <header className="sticky top-0 z-50">
      {/* utility bar */}
      <div className="bg-brand-deep text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
          <p className="flex items-center gap-1.5 font-medium text-white/85">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 text-coral" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" />
            </svg>
            Open {SITE.hours} · {SITE.hoursDays}
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            {SITE.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="flex items-center gap-1.5 font-semibold text-white/85 transition hover:text-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {p.display}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-silver-light/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
        <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="sm" />

          {/* desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            <Link href="/" className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive("/") && !servicesActive ? "bg-brand-light text-brand-dark" : "text-ink-soft hover:bg-cream hover:text-brand"}`}>
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => open("services")}
              onMouseLeave={closeServices}
            >
              <button
                type="button"
                aria-expanded={isOpen("services")}
                aria-haspopup="true"
                onClick={() => toggle("services")}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${servicesActive ? "bg-brand-light text-brand-dark" : "text-ink-soft hover:bg-cream hover:text-brand"}`}
              >
                Services
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`h-3.5 w-3.5 transition ${isOpen("services") ? "rotate-180" : ""}`} aria-hidden="true">
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isOpen("services") && (
                <div className="absolute left-1/2 top-full w-[540px] -translate-x-1/2 pt-2">
                  <div className="animate-fade-up rounded-2xl border border-silver-light bg-white p-3 shadow-2xl shadow-black/10">
                    <ul className="grid grid-cols-2 gap-1">
                      {services.map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/services/${s.slug}`}
                            className="flex items-start gap-3 rounded-xl p-3 transition hover:bg-brand-light"
                          >
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-black text-white">
                              {s.tag.slice(0, 2).toUpperCase()}
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-ink">{s.tag}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-muted line-clamp-2">{s.tagline}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-cream px-4 py-3">
                      <span className="text-xs font-semibold text-muted">Not sure what you need? We will advise you.</span>
                      <Link href="/quote" className="text-xs font-bold text-brand hover:underline">Get a quote →</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(1).map((l) => (
              <Link key={l.href} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive(l.href) ? "bg-brand-light text-brand-dark" : "text-ink-soft hover:bg-cream hover:text-brand"}`}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* actions */}
          <div className="hidden items-center gap-2 xl:flex">
            <div className="w-56">
              <SearchForm />
            </div>
            <Link href="/search" aria-label="Search" className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream hover:text-brand">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-[18px] w-[18px]" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <Link href="/admin" className="rounded-full border border-silver-light px-4 py-2 text-sm font-bold text-ink transition hover:border-brand hover:text-brand">
              Admin
            </Link>
            <Link href="/sign-in" className="rounded-full border border-silver-light px-4 py-2 text-sm font-bold text-ink transition hover:border-brand hover:text-brand">
              Sign In
            </Link>
            <Link href="/quote" className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-coral-dark">
              Get a Quote
            </Link>
          </div>

          {/* mobile toggles */}
          <div className="flex items-center gap-1 lg:hidden">
            <Link href="/search" aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => toggle("mobile")}
              aria-expanded={isOpen("mobile")}
              aria-label={isOpen("mobile") ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream"
            >
              {isOpen("mobile") ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-[22px] w-[22px]"><path d="M18 6 6 18M6 6l12 12" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" className="h-[22px] w-[22px]"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {isOpen("mobile") && (
          <div className="animate-fade-up max-h-[calc(100vh-110px)] overflow-y-auto border-t border-silver-light bg-white px-4 pb-6 pt-4 lg:hidden">
            <SearchForm onSubmit={() => setMenu(null)} />
            <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
              <Link href="/" className="rounded-xl px-3 py-3 font-semibold text-ink hover:bg-brand-light">Home</Link>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((v) => !v)}
                aria-expanded={mobileServicesOpen}
                className="flex items-center justify-between rounded-xl px-3 py-3 font-semibold text-ink hover:bg-brand-light"
              >
                Services
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={`h-4 w-4 transition ${mobileServicesOpen ? "rotate-180" : ""}`} aria-hidden="true"><path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              {mobileServicesOpen && (
                <ul className="mb-1 ml-3 flex flex-col gap-1 border-l-2 border-brand-light pl-3">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-brand-light hover:text-brand-dark">
                        {s.tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} className="rounded-xl px-3 py-3 font-semibold text-ink hover:bg-brand-light">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 flex flex-col gap-3">
              <Link href="/admin" className="rounded-full border border-silver-light px-5 py-3 text-center font-bold text-ink hover:border-brand hover:text-brand">
                Admin
              </Link>
              <Link href="/sign-in" className="rounded-full border border-silver-light px-5 py-3 text-center font-bold text-ink hover:border-brand hover:text-brand">
                Sign In
              </Link>
              <Link href="/quote" className="rounded-full bg-coral px-5 py-3 text-center font-bold text-white hover:bg-coral-dark">
                Get a Quote
              </Link>
              <div className="flex items-center justify-center gap-4 pt-1 text-sm font-semibold text-muted">
                {SITE.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="hover:text-brand">{p.display}</a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
