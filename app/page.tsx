import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import Testimonials from "@/components/Testimonials";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import BeforeAfterSlider from "@/components/BeforeAfter";
import { SITE, beforeAfter, services, whatsappLink } from "@/lib/data";

const toolCards = [
  {
    href: "/quote",
    title: "Get a Quote",
    text: "See what we print, the available sizes and colours, sample projects — then send your brief in two minutes.",
    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4",
    accent: "bg-coral",
  },
  {
    href: "/design",
    title: "Need a Design?",
    text: "Our in-house designers create logos, flyers, social graphics and full brand identities that are ready to print.",
    icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 1 1 3.536 3.536L6.5 21.036H3v-3.536L15.232 5.232z",
    accent: "bg-brand",
  },
  {
    href: "/upload",
    title: "Upload Your Design",
    text: "Send us PNG, JPG/JPEG, PDF or SVG artwork and we will handle proofing, printing and delivery.",
    icon: "M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12",
    accent: "bg-silver-dark",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      {/* marquee of service tags */}
      <div className="overflow-hidden border-y border-silver-light bg-white py-3">
        <div className="animate-marquee flex w-max items-center gap-3 whitespace-nowrap">
          {[...services, ...services, ...services].map((s, i) => (
            <Link
              key={`${s.slug}-${i}`}
              href={`/services/${s.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-silver-light px-4 py-1.5 text-xs font-black uppercase tracking-widest text-ink-soft transition hover:border-brand hover:bg-brand hover:text-white"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
              {s.tag}
            </Link>
          ))}
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Our Services</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  Seven service tags. One printshop.
                </h2>
                <p className="mt-3 text-muted">
                  Every tag below is its own page — with the products, details and sample work inside.
                </p>
              </div>
              <Link href="/services" className="rounded-full border border-brand/25 px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                View all services →
              </Link>
            </div>
          </Reveal>

          {/* category tags */}
          <div className="mt-8 flex flex-wrap gap-2">
            {services.map((s, i) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-sm transition hover:-translate-y-0.5 ${
                  i % 3 === 0 ? "bg-brand hover:bg-brand-dark" : i % 3 === 1 ? "bg-coral hover:bg-coral-dark" : "bg-ink hover:bg-brand-dark"
                }`}
              >
                {s.tag}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 4) * 80}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-ink/5 ring-1 ring-silver-light transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/10"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.cardImage} alt={s.tag} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-dark backdrop-blur">
                      0{i + 1}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-black text-ink transition group-hover:text-brand">{s.tag}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">{s.tagline}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-coral">
                      Explore {s.tag}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true">
                        <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}

            <Reveal delay={240} className="sm:col-span-2 lg:col-span-1">
              <div className="flex h-full flex-col justify-between rounded-3xl bg-ink p-6 text-white">
                <div>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-coral text-xl font-black">+</span>
                  <h3 className="mt-4 text-lg font-black">Something custom?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    If it carries a logo, we can print it. Tell us what you have in mind and we will find a way.
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <Link href="/quote" className="rounded-full bg-coral px-5 py-3 text-center text-sm font-black transition hover:bg-coral-dark">Request a quote</Link>
                  <a href={whatsappLink("Hello Kabaprints! I have a custom print request.")} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 px-5 py-3 text-center text-sm font-bold transition hover:bg-white/10">
                    Chat with us
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VISION — displayed boldly, words exactly as given */}
      <section className="relative overflow-hidden bg-ink py-20 text-white sm:py-24" aria-label="Our vision">
        <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-coral/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-coral">Our Vision</p>
          <svg viewBox="0 0 24 24" fill="currentColor" className="mx-auto mt-8 h-10 w-10 text-brand-mid/60" aria-hidden="true">
            <path d="M9.5 5C6.5 6.6 4.5 9.6 4.5 13v6h6v-6H7.5c0-2.3 1-4.2 3-5.3L9.5 5zm10 0c-3 1.6-5 4.6-5 8v6h6v-6h-3c0-2.3 1-4.2 3-5.3L19.5 5z" />
          </svg>
          <p className="mt-8 text-2xl font-black leading-snug tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.25]">
            {SITE.vision}
          </p>
        </div>
      </section>

      {/* TOOLS */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Essential Tools</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Everything you need, one click away</h2>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {toolCards.map((t, i) => (
              <Reveal key={t.href} delay={i * 90}>
                <Link href={t.href} className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-silver-light transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${t.accent} text-white`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d={t.icon} />
                    </svg>
                  </span>
                  <h3 className="mt-4 text-lg font-black text-ink transition group-hover:text-brand">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted flex-1">{t.text}</p>
                  <span className="mt-4 text-sm font-bold text-brand">Go to {t.title.toLowerCase()} →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      <section className="bg-white py-16 sm:py-20 ring-1 ring-silver-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Kabaprints Works</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Before &amp; after the press</h2>
                <p className="mt-3 max-w-xl text-muted">Drag the handle to see the transformation. Real projects, real finishes.</p>
              </div>
              <Link href="/portfolio" className="rounded-full border border-brand/25 px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-brand hover:text-white">
                See full portfolio →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {beforeAfter.slice(0, 2).map((pair, i) => (
              <Reveal key={pair.title} delay={i * 100}>
                <BeforeAfterSlider pair={pair} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* OPEN HOURS + CONTACT */}
      <section className="py-16 sm:py-20" aria-label="Open hours and contact">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="flex h-full flex-col justify-between rounded-3xl bg-brand p-8 text-white sm:p-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Open Hours</p>
                  <p className="mt-4 text-5xl font-black tracking-tight">{SITE.hours}</p>
                  <p className="mt-2 text-xl font-semibold text-white/85">{SITE.hoursDays}</p>
                  <p className="mt-4 text-sm text-white/60">Walk-ins welcome · Orders accepted any time online</p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  {SITE.phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`} className="rounded-full bg-white px-5 py-3 text-sm font-black text-brand-dark transition hover:bg-cream">
                      📞 {p.display}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="flex h-full flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-silver-light sm:p-10">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Let&apos;s talk</p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                    Questions? We reply fast.
                  </h2>
                  <p className="mt-3 text-muted">
                    Send a message on WhatsApp with your size, quantity and deadline — we will come back to you
                    with pricing and production time the same day.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-sm text-ink-soft">
                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-coral" />Same-day quotes during opening hours</li>
                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-brand" />Free proof before we print</li>
                    <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-silver" />Pick-up, dispatch and installation available</li>
                  </ul>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="rounded-full bg-whatsapp px-6 py-3 text-sm font-black text-white transition hover:brightness-95">
                    WhatsApp {SITE.whatsappDisplay}
                  </a>
                  <Link href="/contact" className="rounded-full border border-silver-light px-6 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand">
                    Contact page
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
