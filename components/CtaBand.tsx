import Link from "next/link";
import { getSiteContent } from "@/lib/site-content";
import { whatsappHref } from "@/lib/content-utils";

/** Call-to-action band used at the bottom of most pages. */
export default async function CtaBand({
  title = "Ready to start your print job?",
  text,
}: { title?: string; text?: string }) {
  const { site } = await getSiteContent();
  const body =
    text ??
    `Send us your brief or artwork today and get a same-day quote. Open ${site.hours}, ${site.hoursDays} — walk-ins welcome.`;

  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-coral/30 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-brand-mid/40 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-3 text-white/80">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/quote" className="rounded-full bg-coral px-7 py-3.5 text-sm font-black shadow-lg shadow-black/20 transition hover:bg-coral-dark">
            Get a Quote
          </Link>
          <Link href="/upload" className="rounded-full bg-white px-7 py-3.5 text-sm font-black text-brand-dark transition hover:bg-cream">
            Upload Your Design
          </Link>
          <a href={whatsappHref(site.whatsappNumber)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-black transition hover:bg-white/10">
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}
