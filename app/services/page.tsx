import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "All Services",
  description:
    "Transfer print, screen print, clean banners, van display, engraving, signage and more — every Kabaprints service in one place.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="bg-brand-deep py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="mx-1">/</span> <span className="text-white">Services</span>
          </nav>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Our Services</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Seven dedicated service pages covering apparel, bulk printing, large format, vehicles,
            engraving and signage — plus the odd special request.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full border border-white/25 px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition hover:border-coral hover:bg-coral">
                {s.tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 100}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid overflow-hidden rounded-3xl bg-white ring-1 ring-silver-light transition hover:shadow-2xl hover:shadow-brand/10 md:grid-cols-[1.1fr_1.4fr]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[280px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.cardImage} alt={s.tag} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-brand-dark">0{i + 1}</span>
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-9">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">{s.tag}</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight transition group-hover:text-brand sm:text-3xl">{s.tagline}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">{s.description}</p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {s.items.slice(0, 4).map((item) => (
                        <li key={item.title} className="rounded-full bg-brand-light px-3 py-1 text-[11px] font-bold text-brand-dark">{item.title}</li>
                      ))}
                      {s.items.length > 4 && <li className="rounded-full bg-cream px-3 py-1 text-[11px] font-bold text-muted">+{s.items.length - 4} more</li>}
                    </ul>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-coral">
                      Open {s.tag} page
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="Not sure which service fits?" text="Describe your job and we will recommend the right print method, material and price range." />
    </>
  );
}
