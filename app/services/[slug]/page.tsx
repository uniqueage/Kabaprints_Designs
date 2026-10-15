import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import { getSiteContent } from "@/lib/site-content";
import { whatsappHref } from "@/lib/content-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { services } = await getSiteContent();
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service not found" };
  return { title: service.tag, description: `${service.tagline} ${service.description}`.slice(0, 180) };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await getSiteContent();
  const services = content.services;
  const site = content.site;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  const index = services.findIndex((s) => s.slug === service.slug);
  const next = services[(index + 1) % services.length] ?? service;

  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-brand-deep text-white">
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={service.heroImage} alt="" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/90 to-brand-deep/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/services" className="hover:text-coral">Services</Link>
            <span className="mx-1.5">/</span>
            <span className="text-white">{service.tag}</span>
          </nav>
          <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-coral/50 bg-coral/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-coral">
            Service 0{index + 1}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">{service.tag}</h1>
          <p className="mt-4 max-w-2xl text-base text-white/80">{service.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quote" className="rounded-full bg-coral px-6 py-3 text-sm font-black transition hover:bg-coral-dark">Get a Quote</Link>
            <Link href="/upload" className="rounded-full bg-white px-6 py-3 text-sm font-black text-brand-dark transition hover:bg-cream">Upload Design</Link>
            <a href={whatsappHref(site.whatsappNumber, `Hello Kabaprints! I'm interested in your ${service.tag} service.`)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/35 px-6 py-3 text-sm font-black transition hover:bg-white/10">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* intro */}
      <section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <Reveal>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">What it is</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">{service.tag}, done properly</h2>
              <p className="mt-4 leading-relaxed text-ink-soft">{service.description}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { k: "Substrates", v: service.substrates.length },
                  { k: "Techniques", v: service.techniques.length },
                  { k: "Products", v: service.items.length },
                ].map((stat) => (
                  <div key={stat.k} className="rounded-2xl bg-white p-5 ring-1 ring-silver-light">
                    <p className="text-2xl font-black text-brand">{stat.v}<span className="text-coral">+</span></p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">{stat.k}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-3xl bg-white p-6 ring-1 ring-silver-light">
              {service.bestFor.length > 0 && (
                <>
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-dark">Best for</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {service.bestFor.map((b) => (
                      <li key={b} className="rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-dark">{b}</li>
                    ))}
                  </ul>
                </>
              )}
              {service.substrates.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-brand-dark">Materials we print on</h3>
                  <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                    {service.substrates.map((m) => (
                      <li key={m} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden="true" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {service.techniques.length > 0 && (
                <>
                  <h3 className="mt-6 text-sm font-black uppercase tracking-widest text-brand-dark">Techniques</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {service.techniques.map((t) => (
                      <li key={t} className="rounded-full border border-silver-light px-3 py-1.5 text-xs font-semibold text-ink-soft">{t}</li>
                    ))}
                  </ul>
                </>
              )}
              {service.bestFor.length === 0 && service.substrates.length === 0 && service.techniques.length === 0 && (
                <p className="text-sm text-muted">
                  Ask us for the full material and technique list for this service — we will send it over with your quote.
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* items grid */}
      <section className="bg-white py-14 ring-1 ring-silver-light sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">What we offer</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Images &amp; details</h2>
            <p className="mt-3 text-muted">Every product under {service.tag} — what it is and when to use it.</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {service.items.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 90}>
                <article className="group h-full overflow-hidden rounded-3xl bg-cream ring-1 ring-silver-light transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-black text-ink transition group-hover:text-brand">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.blurb}</p>
                    <Link href="/quote" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                      Price this <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* next service */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href={`/services/${next.slug}`} className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-ink px-7 py-6 text-white transition hover:bg-brand-dark">
            <span>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-coral">Next service</span>
              <span className="mt-1 block text-2xl font-black">{next.tag} →</span>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={next.cardImage} alt="" className="h-16 w-24 rounded-xl object-cover" />
          </Link>
        </div>
      </section>

      <CtaBand
        title={`Ready to print ${service.tag.toLowerCase()}?`}
        text="Send your brief, quantity and deadline — we will reply with a same-day quote and a free proof."
      />
    </>
  );
}
