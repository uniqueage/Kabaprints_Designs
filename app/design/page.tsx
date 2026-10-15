import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import { getSiteContent } from "@/lib/site-content";
import { whatsappHref } from "@/lib/content-utils";

export const metadata: Metadata = {
  title: "Need a Design?",
  description: "Logo design, brand identity, flyers, social graphics and print-ready artwork from the Kabaprints design studio.",
};

const deliverables = [
  "Print-ready PDF with bleed and crop marks",
  "Editable source file (AI / PSD / SVG)",
  "Web-ready PNG & JPG exports",
  "Two rounds of revisions included",
  "Free re-export when specs change before press",
];

export default async function DesignPage() {
  const content = await getSiteContent();
  const designServices = content.designServices;
  const designProcess = content.designProcess;
  const SITE = content.site;

  return (
    <>
      <section className="relative overflow-hidden bg-coral-dark py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-coral/50 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/70">
            <Link href="/" className="hover:text-white/90">Home</Link> <span className="mx-1">/</span> <span className="text-white">Need a Design?</span>
          </nav>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.3em]">
            Design Studio
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Need a design? <span className="font-display font-medium italic">We draw, you grow.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            No artwork? No problem. Our in-house creatives build logos, campaigns and print layouts that are
            born ready for the press — so nothing is lost between design and production.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={whatsappHref(SITE.whatsappNumber, "Hello Kabaprints! I need a design. Here is what I have in mind:")} target="_blank" rel="noopener noreferrer" className="rounded-full bg-white px-6 py-3.5 text-sm font-black text-coral-dark transition hover:bg-cream">
              Brief us on WhatsApp
            </a>
            <Link href="/quote" className="rounded-full border border-white/40 px-6 py-3.5 text-sm font-black transition hover:bg-white/10">
              Request a quote
            </Link>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">What we design</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Creative services</h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {designServices.map((d, i) => (
              <Reveal key={d.title} delay={(i % 3) * 80}>
                <div className="group h-full rounded-3xl bg-white p-6 ring-1 ring-silver-light transition hover:-translate-y-1 hover:shadow-xl hover:shadow-coral/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral text-white transition group-hover:rotate-6">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z" />
                    </svg>
                  </span>
                  <h3 className="mt-4 text-lg font-black text-ink transition group-hover:text-coral">{d.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 ring-1 ring-silver-light sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">How it works</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Four steps to finished artwork</h2>
            </div>
          </Reveal>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {designProcess.map((p, i) => (
              <Reveal key={p.step} delay={i * 80}>
                <li className="relative h-full rounded-3xl bg-cream p-6 ring-1 ring-silver-light">
                  <span className="text-4xl font-black text-brand-light">{p.step}</span>
                  <h3 className="mt-2 font-black text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.detail}</p>
                </li>
              </Reveal>
            ))}
          </ol>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl bg-ink p-7 text-white">
              <h3 className="text-xl font-black">What you receive</h3>
              <ul className="mt-4 space-y-3">
                {deliverables.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-white/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral text-[10px] font-black">✓</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center rounded-3xl bg-brand-light p-7 ring-1 ring-brand/10">
              <h3 className="text-xl font-black text-ink">Design + print, one team</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Because design and printing live under one roof, colours match, files are press-ready and
                revisions happen in minutes — not days. Approve the artwork and we start the same week.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/upload" className="rounded-full bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark">Upload existing artwork</Link>
                <Link href="/portfolio" className="rounded-full border border-brand/25 px-6 py-3 text-sm font-black text-brand transition hover:bg-brand hover:text-white">See our work</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand title="Let's design something people remember." text="Share your brief today and receive first concepts within a few working days." />
    </>
  );
}
