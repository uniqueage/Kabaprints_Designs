import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/components/SignInForm";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage() {
  const content = await getSiteContent();
  const SITE = content.site;
  const services = content.services;

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Customer account</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Sign in to <span className="font-display font-medium italic text-brand">Kabaprints</span>
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-ink-soft">
            Access your quote requests, uploaded artwork and order history in one place. First time here?
            You can order without an account — just send us a brief.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-ink-soft">
            <li className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-coral" />Track every quote in one dashboard</li>
            <li className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-brand" />Re-download proofs and invoices</li>
            <li className="flex items-center gap-2.5"><span className="h-2 w-2 rounded-full bg-silver" />Faster re-orders of proven jobs</li>
          </ul>
          <div className="mt-8 rounded-2xl bg-brand-light p-5 text-sm text-brand-dark ring-1 ring-brand/10">
            <strong>Prefer not to sign in?</strong>{" "}
            <Link href="/quote" className="font-bold underline">Get a quote</Link>,{" "}
            <Link href="/upload" className="font-bold underline">upload artwork</Link> or call{" "}
            <a href={`tel:${SITE.phones[0].tel}`} className="font-bold underline">{SITE.phones[0].display}</a>.
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {services.slice(0, 4).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-ink-soft ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                {s.tag}
              </Link>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <SignInForm site={SITE} />
        </div>
      </div>
    </section>
  );
}
