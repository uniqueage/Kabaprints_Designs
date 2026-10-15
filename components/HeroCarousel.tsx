"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroSlide } from "@/lib/data";

const DURATION = 6000;

interface Props {
  /** Live hero slides from the admin dashboard (falls back to the static set). */
  slides: HeroSlide[];
  /** Number of live services, shown in the hero stats. */
  serviceCount: number;
  /** Opening hours line, shown in the hero stats. */
  hours: string;
}

export default function HeroCarousel({ slides, serviceCount, hours }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length || 1;

  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), DURATION);
    return () => clearInterval(t);
  }, [paused, count]);

  const slide = slides[index % count];

  if (!slide) return null;

  return (
    <section
      className="relative overflow-hidden bg-brand-deep text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Kabaprints printing showcases"
    >
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-mid/40 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-coral/25 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-20 lg:pt-20">
        {/* headline column */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.3em] text-coral">
            Printshop <span className="text-white">+</span> Design
          </span>

          <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            Prints that turn heads.
            <span className="block font-display font-medium italic text-coral">Designs that win hearts.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Kabaprints is your one-stop printshop for apparel printing, banners, vehicle branding,
            engraving and signage — produced in-house, checked twice and delivered on time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/quote" className="rounded-full bg-coral px-7 py-3.5 text-sm font-black shadow-lg shadow-coral/30 transition hover:bg-coral-dark hover:shadow-xl">
              Get a Quote
            </Link>
            <Link href="/services" className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:border-white hover:bg-white/10">
              Browse Services
            </Link>
            <Link href="/design" className="text-sm font-bold text-brand-mid underline-offset-4 transition hover:text-white hover:underline">
              Need a design? →
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">Services</dt>
              <dd className="text-2xl font-black">{serviceCount}<span className="text-coral">+</span></dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">Open</dt>
              <dd className="text-2xl font-black">{hours}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-white/50">Since</dt>
              <dd className="text-2xl font-black">Day 1</dd>
            </div>
          </dl>
        </div>

        {/* rotating pictures column */}
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 shadow-2xl shadow-black/40 sm:aspect-[16/11]">
            {slides.map((s, i) => (
              <div
                key={s.image}
                className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "slide-active opacity-100" : "opacity-0"}`}
                aria-hidden={i !== index}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={`${s.eyebrow} — ${s.title}`} className={`h-full w-full object-cover ${i === index ? "kb" : ""}`} loading={i === 0 ? "eager" : "lazy"} />
              </div>
            ))}

            {/* rotating details card */}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-ink/85 p-4 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0" key={slide.href}>
                  <p className="animate-fade-up text-[10px] font-black uppercase tracking-[0.28em] text-coral">{slide.eyebrow}</p>
                  <h2 className="animate-fade-up mt-1.5 text-base font-extrabold leading-snug sm:text-lg" style={{ animationDelay: "60ms" }}>
                    {slide.title}
                  </h2>
                  <p className="animate-fade-up mt-1.5 hidden text-sm leading-relaxed text-white/70 sm:block" style={{ animationDelay: "120ms" }}>
                    {slide.blurb}
                  </p>
                  <div className="animate-fade-up mt-3 flex flex-wrap gap-1.5" style={{ animationDelay: "180ms" }}>
                    {slide.meta.map((m) => (
                      <span key={m} className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">{m}</span>
                    ))}
                  </div>
                </div>
                <Link href={slide.href} className="mt-1 hidden shrink-0 items-center gap-1 rounded-full bg-coral px-4 py-2 text-xs font-black text-white transition hover:bg-coral-dark sm:inline-flex">
                  {slide.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {/* arrows */}
            <div className="absolute right-3 top-3 flex gap-2">
              <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true"><path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          {/* dots + counter */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.image}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
                  aria-current={i === index}
                  className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-coral" : "w-2 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
            <p className="font-mono text-xs text-white/60">
              <span className="text-white">0{index + 1}</span> / 0{count}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
