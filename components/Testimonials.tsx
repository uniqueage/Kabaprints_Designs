"use client";

import { useEffect, useState } from "react";
import { testimonials } from "@/lib/data";

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const t = testimonials[index];

  return (
    <section
      className="bg-brand-light/60 py-16 sm:py-20"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-coral">Testimonials</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">What our clients say</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)} aria-label="Previous testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/20 bg-white text-brand transition hover:bg-brand hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true"><path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" onClick={() => setIndex((i) => (i + 1) % testimonials.length)} aria-label="Next testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/20 bg-white text-brand transition hover:bg-brand hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true"><path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <figure className="relative rounded-3xl bg-white p-7 shadow-xl shadow-brand/5 ring-1 ring-brand/10 sm:p-10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-9 w-9 text-coral/40" aria-hidden="true">
              <path d="M9.5 5C6.5 6.6 4.5 9.6 4.5 13v6h6v-6H7.5c0-2.3 1-4.2 3-5.3L9.5 5zm10 0c-3 1.6-5 4.6-5 8v6h6v-6h-3c0-2.3 1-4.2 3-5.3L19.5 5z" />
            </svg>
            <blockquote key={index} className="animate-fade-up mt-4 text-lg font-medium leading-relaxed text-ink sm:text-xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-sm font-black text-white">{t.initials}</span>
              <span>
                <span className="block font-bold text-ink">{t.name}</span>
                <span className="block text-sm text-muted">{t.role}</span>
              </span>
              <span className="ml-auto flex gap-0.5 text-coral" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" /></svg>
                ))}
              </span>
            </figcaption>
            <div className="mt-7 flex gap-1.5 border-t border-silver-light pt-5">
              {testimonials.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show testimonial from ${item.name}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-coral" : "w-4 bg-silver-light hover:bg-silver"}`}
                />
              ))}
            </div>
          </figure>

          <div className="grid gap-4">
            {testimonials.slice(0, 2).map((item, i) => {
              const realIndex = (index + 1 + i) % testimonials.length;
              const other = testimonials[realIndex];
              return (
                <div key={other.name} className="rounded-3xl bg-white p-6 ring-1 ring-brand/10">
                  <div className="flex gap-0.5 text-coral" aria-hidden="true">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" /></svg>
                    ))}
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-ink-soft">“{other.quote}”</p>
                  <p className="mt-3 text-sm"><span className="font-bold text-ink">{other.name}</span> <span className="text-muted">· {other.role}</span></p>
                  <span className="sr-only">{i}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
