import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import BeforeAfterSlider from "@/components/BeforeAfter";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Portfolio — Kabaprints Works",
  description: "Kabaprints works: before and after product displays across transfer print, screen print, banners, vehicles, engraving and signage.",
};

export default async function PortfolioPage() {
  const content = await getSiteContent();
  const beforeAfter = content.beforeAfter;
  const portfolioWorks = content.portfolioWorks;
  const services = content.services;

  return (
    <>
      <section className="bg-brand-deep py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="mx-1">/</span> <span className="text-white">Portfolio</span>
          </nav>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            Kabaprints <span className="font-display font-medium italic text-coral">works</span>
          </h1>
          <p className="mt-3 max-w-2xl text-white/75">
            A gallery of jobs we have produced — plus before-and-after displays so you can see the exact
            transformation your brand will get.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
            <a href="#before-after" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Before &amp; after</a>
            <a href="#gallery" className="rounded-full border border-white/25 px-4 py-1.5 transition hover:bg-white/10">Works gallery</a>
            <Link href="/quote" className="rounded-full bg-coral px-4 py-1.5 transition hover:bg-coral-dark">Start your project</Link>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="before-after" className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Before &amp; after</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Drag to reveal the difference</h2>
              <p className="mt-3 text-muted">Plain product on the left, finished Kabaprints job on the right.</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {beforeAfter.map((pair, i) => (
              <Reveal key={pair.title} delay={(i % 2) * 100}>
                <BeforeAfterSlider pair={pair} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" className="bg-white py-14 ring-1 ring-silver-light sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">The works</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Kabaprints works gallery</h2>
              </div>
              <span className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-muted ring-1 ring-silver-light">
                {portfolioWorks.length} projects
              </span>
            </div>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-black uppercase tracking-widest text-white">All</span>
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full bg-cream px-4 py-2 text-xs font-black uppercase tracking-widest text-ink-soft ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                {s.tag}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {portfolioWorks.map((w, i) => {
              const service = services.find((s) => s.slug === w.category);
              return (
                <Reveal key={w.title} delay={(i % 4) * 70}>
                  <figure className="group overflow-hidden rounded-3xl bg-cream ring-1 ring-silver-light transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={w.image} alt={w.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-ink/85 p-3 text-xs font-semibold text-white backdrop-blur transition duration-300 group-hover:translate-y-0">
                        {w.note}
                      </figcaption>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <h3 className="text-sm font-black text-ink">{w.title}</h3>
                      <Link href={`/services/${w.category}`} className="text-[10px] font-black uppercase tracking-widest text-brand hover:text-coral">
                        {service?.tag}
                      </Link>
                    </div>
                  </figure>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaBand title="Want results like these?" text="Your project goes here next — start with a quote or send us your artwork." />
    </>
  );
}
