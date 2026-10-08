"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { buildSearchIndex, services } from "@/lib/data";

export default function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    const index = buildSearchIndex();
    if (!q) return [];
    return index.filter((entry) =>
      `${entry.title} ${entry.description} ${entry.type}`.toLowerCase().includes(q)
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        className="flex gap-2"
      >
        <label htmlFor="search-page-input" className="sr-only">Search Kabaprints</label>
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="search-page-input"
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services, products, pages…"
            className="w-full rounded-full border border-silver-light bg-white py-4 pl-12 pr-4 text-base shadow-sm focus:border-brand focus:outline-none"
          />
        </div>
        <button type="submit" className="rounded-full bg-brand px-7 py-4 text-sm font-black text-white transition hover:bg-brand-dark">
          Search
        </button>
      </form>

      {!q && (
        <div className="mt-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-brand-dark">Popular searches</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {services.flatMap((s) => [s.tag, ...s.items.map((i) => i.title)]).map((term) => (
              <button key={term} type="button" onClick={() => setQuery(term)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-soft ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                {term}
              </button>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">Start typing to see matching pages, services and products.</p>
        </div>
      )}

      {q && (
        <div className="mt-8">
          <p className="text-sm text-muted">
            {results.length === 0 ? "No results for" : `${results.length} result${results.length > 1 ? "s" : ""} for`}{" "}
            <span className="font-black text-ink">“{query.trim()}”</span>
          </p>

          {results.length === 0 && (
            <div className="mt-6 rounded-3xl bg-white p-8 text-center ring-1 ring-silver-light">
              <p className="text-lg font-black text-ink">Nothing matched that search</p>
              <p className="mt-2 text-sm text-muted">Try “banner”, “t-shirt”, “branding”, “engraving” — or just ask us directly.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link href="/services" className="rounded-full bg-brand px-5 py-2.5 text-sm font-black text-white transition hover:bg-brand-dark">Browse all services</Link>
                <Link href="/quote" className="rounded-full border border-silver-light px-5 py-2.5 text-sm font-black text-ink transition hover:border-brand hover:text-brand">Get a quote</Link>
              </div>
            </div>
          )}

          <ul className="mt-5 space-y-3">
            {results.map((r) => (
              <li key={`${r.type}-${r.title}-${r.href}`}>
                <Link href={r.href} className="group flex items-start gap-4 rounded-2xl bg-white p-5 ring-1 ring-silver-light transition hover:shadow-lg hover:shadow-brand/10 hover:ring-brand">
                  <span className="mt-0.5 shrink-0 rounded-full bg-brand-light px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-dark">
                    {r.type}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-black text-ink transition group-hover:text-brand">{r.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted line-clamp-2">{r.description}</span>
                  </span>
                  <span className="ml-auto mt-1 shrink-0 text-brand opacity-0 transition group-hover:opacity-100" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
