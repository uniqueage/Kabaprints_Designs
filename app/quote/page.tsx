import type { Metadata } from "next";
import Link from "next/link";
import QuoteForm from "@/components/QuoteForm";
import Reveal from "@/components/Reveal";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "What we print, the materials, available sizes and colours, sample projects — then request your Kabaprints quote.",
};

const steps = [
  { n: "01", t: "Tell us the job", d: "Service, quantity, sizes and deadline — as much or as little as you know." },
  { n: "02", t: "We price it", d: "A clear quote with unit price, production time and delivery options the same day." },
  { n: "03", t: "Free proof", d: "We send a digital proof or physical sample for approval before a single press runs." },
  { n: "04", t: "Produce & deliver", d: "Printing, finishing, quality check, then pick-up, dispatch or installation." },
];

export default async function QuotePage() {
  const content = await getSiteContent();
  const SITE = content.site;
  const services = content.services;
  const portfolioWorks = content.portfolioWorks;
  const printableMaterials = content.printableMaterials;
  const printSizes = content.printSizes;
  const printColors = content.printColors;
  const colorNotes = content.colorNotes;

  return (
    <>
      <section className="bg-brand-deep py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="mx-1">/</span> <span className="text-white">Quote</span>
          </nav>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Get a Quote</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Everything you need before you order: what a quote is, what we can print, the sizes and colours
            available, and sample projects we have delivered.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
            <a href="#what" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">What it is</a>
            <a href="#materials" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Materials</a>
            <a href="#sizes" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Sizes</a>
            <a href="#colours" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Colours</a>
            <a href="#samples" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Sample projects</a>
            <a href="#form" className="rounded-full bg-coral px-4 py-1.5 transition hover:bg-coral-dark">Request quote</a>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section id="what" className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">What it is</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">A Kabaprints quote, explained</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                A quote is your fixed, written price for a print job — covering design, materials, printing,
                finishing and delivery — valid for 7 days. It costs nothing and commits you to nothing.
                You approve it only when you are happy with the price and the proof.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 80}>
                <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-silver-light">
                  <span className="text-3xl font-black text-brand-light">{s.n}</span>
                  <h3 className="mt-2 font-black text-ink">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ink-soft ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                {s.tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MATERIALS */}
      <section id="materials" className="bg-white py-14 ring-1 ring-silver-light sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">What can be printed</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Materials we print on</h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {printableMaterials.map((m, i) => (
              <Reveal key={m.name} delay={(i % 4) * 70}>
                <div className="h-full rounded-3xl bg-cream p-6 ring-1 ring-silver-light">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-sm font-black text-white">✓</span>
                  <h3 className="mt-3 font-black text-ink">{m.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SIZES */}
      <section id="sizes" className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Available sizes</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Standard sizes &amp; custom cuts</h2>
              <p className="mt-3 text-muted">Anything not listed can be custom-quoted — we cut to your dimensions.</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {printSizes.map((group, i) => (
              <Reveal key={group.group} delay={i * 70}>
                <div className="h-full rounded-3xl bg-ink p-6 text-white">
                  <h3 className="text-sm font-black uppercase tracking-widest text-coral">{group.group}</h3>
                  <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                    {group.sizes.map((s) => (
                      <li key={s} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-mid" aria-hidden="true" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COLOURS */}
      <section id="colours" className="bg-white py-14 ring-1 ring-silver-light sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Available colours</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Colours you can print in</h2>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {printColors.map((c, i) => (
              <Reveal key={c.hex} delay={i * 50}>
                <div className="overflow-hidden rounded-2xl ring-1 ring-silver-light">
                  <div className="h-20 w-full" style={{ backgroundColor: c.hex }} aria-hidden="true" />
                  <div className="bg-white p-3">
                    <p className="text-xs font-black text-ink">{c.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] uppercase text-muted">{c.hex}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {colorNotes.map((note) => (
              <li key={note} className="flex items-start gap-2.5 rounded-2xl bg-cream p-4 text-sm text-ink-soft ring-1 ring-silver-light">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral text-[10px] font-black text-white">●</span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SAMPLE PROJECTS */}
      <section id="samples" className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Sample projects</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Recent work at a glance</h2>
              </div>
              <Link href="/portfolio" className="rounded-full border border-brand/25 px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                Full portfolio →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioWorks.slice(0, 6).map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 80}>
                <figure className="group overflow-hidden rounded-3xl bg-white ring-1 ring-silver-light">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={w.image} alt={w.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <figcaption className="flex items-center justify-between p-4">
                    <span className="text-sm font-black text-ink">{w.title}</span>
                    <span className="text-[11px] font-semibold text-muted">{w.note}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="bg-brand-light/60 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8">
          <div>
            <QuoteForm site={SITE} services={services} />
          </div>
          <aside className="space-y-5">
            <div className="rounded-3xl bg-brand p-6 text-white">
              <h3 className="text-lg font-black">Open hours</h3>
              <p className="mt-3 text-2xl font-black">{SITE.hours}</p>
              <p className="text-white/80">{SITE.hoursDays}</p>
              <p className="mt-4 text-sm text-white/60">Open around the clock — quote requests are answered the same day, any day of the week.</p>
            </div>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-silver-light">
              <h3 className="text-lg font-black text-ink">Prefer to talk?</h3>
              <div className="mt-4 space-y-2.5">
                {SITE.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                    📞 {p.display} <span aria-hidden="true">→</span>
                  </a>
                ))}
              </div>
              <p className="mt-5 text-sm text-muted">
                Already have artwork? <Link href="/upload" className="font-bold text-brand hover:underline">Upload your design</Link> first.
              </p>
            </div>
            <div className="rounded-3xl bg-ink p-6 text-white">
              <h3 className="text-lg font-black">Need the design too?</h3>
              <p className="mt-2 text-sm text-white/70">Our designers can create the artwork from scratch before it goes to press.</p>
              <Link href="/design" className="mt-4 inline-block rounded-full bg-coral px-5 py-2.5 text-sm font-black transition hover:bg-coral-dark">
                Need a Design? →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
