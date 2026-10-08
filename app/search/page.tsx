import type { Metadata } from "next";
import { Suspense } from "react";
import SearchResults from "@/components/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Kabaprints services, products and pages.",
};

export default function SearchPage() {
  return (
    <section className="min-h-[60vh] bg-cream">
      <div className="bg-brand-deep py-10 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Search Kabaprints</h1>
          <p className="mt-2 text-white/70">Find a service, product or page in seconds.</p>
        </div>
      </div>
      <Suspense fallback={<p className="mx-auto max-w-4xl px-4 py-12 text-muted">Loading search…</p>}>
        <SearchResults />
      </Suspense>
    </section>
  );
}
