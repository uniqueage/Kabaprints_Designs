import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-16">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <p className="text-7xl font-black text-brand-light">404</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">This page ran off the press</h1>
        <p className="mt-3 text-muted">
          The page you are looking for does not exist or has been moved. Try a search, or head back home.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark">Back to home</Link>
          <Link href="/search" className="rounded-full border border-silver-light px-6 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand">Search the site</Link>
          <Link href="/services" className="rounded-full border border-silver-light px-6 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand">All services</Link>
        </div>
      </div>
    </section>
  );
}
