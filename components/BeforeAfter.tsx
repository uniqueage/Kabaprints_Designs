"use client";

import { useCallback, useRef, useState } from "react";
import type { BeforeAfter as Pair } from "@/lib/data";

export default function BeforeAfterSlider({ pair }: { pair: Pair }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const setFromX = useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(97, Math.max(3, pct)));
  }, []);

  return (
    <figure className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-ink/5 ring-1 ring-silver-light">
      <div
        ref={ref}
        className="relative aspect-[4/3] cursor-ew-resize touch-none select-none overflow-hidden"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          setDragging(true);
          setFromX(e.clientX);
        }}
        onPointerMove={(e) => dragging && setFromX(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* AFTER (base layer) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pair.after} alt={`${pair.title} — after`} className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />

        {/* BEFORE (clipped to the left of the handle) */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pair.before} alt={`${pair.title} — before`} className="pointer-events-none absolute inset-0 h-full w-full object-cover" draggable={false} />
        </div>

        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">Before</span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-coral px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur">After</span>

        {/* handle */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]" style={{ left: `${pos}%` }}>
          <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-brand text-white shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4" aria-hidden="true">
              <path d="m9 6-5 6 5 6M15 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <input
          type="range"
          min={3}
          max={97}
          value={Math.round(pos)}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`Reveal the result for ${pair.title}`}
          className="absolute bottom-2 left-1/2 w-[calc(100%-2rem)] -translate-x-1/2 accent-coral opacity-0 focus-visible:opacity-100"
        />
      </div>

      <figcaption className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-black text-ink">{pair.title}</h3>
          <a href={pair.href} className="rounded-full bg-brand-light px-3 py-1 text-xs font-black uppercase tracking-wider text-brand-dark transition hover:bg-brand hover:text-white">
            {pair.service}
          </a>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{pair.note}</p>
      </figcaption>
    </figure>
  );
}
