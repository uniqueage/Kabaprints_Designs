import type { Metadata } from "next";
import Link from "next/link";
import UploadDropzone from "@/components/UploadDropzone";
import CtaBand from "@/components/CtaBand";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Upload Your Design",
  description: "Upload your print-ready PNG, JPG/JPEG, PDF or SVG artwork to Kabaprints for same-day proofing.",
};

const checklist = [
  "Artwork at 300 DPI (or vector: SVG / PDF)",
  "3 mm bleed on flyers, cards and stickers",
  "Fonts outlined or embedded",
  "CMYK for press jobs, RGB for screens",
  "White backgrounds removed for transfers (if needed)",
];

export default function UploadPage() {
  return (
    <>
      <section className="bg-brand-deep py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="mx-1">/</span> <span className="text-white">Upload Design</span>
          </nav>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Upload your design</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Send us your artwork for printing. We accept PNG, JPG/JPEG, PDF and SVG files — proofed by our team
            before anything goes to press.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div>
            <UploadDropzone />
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-silver-light">
              <h2 className="text-lg font-black text-ink">File checklist</h2>
              <ul className="mt-4 space-y-3">
                {checklist.map((c) => (
                  <li key={c} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-black text-white">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-coral-light p-6 ring-1 ring-coral/20">
              <h2 className="text-lg font-black text-coral-dark">No design yet?</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Our designers can create print-ready artwork for you — then it goes straight to production.
              </p>
              <Link href="/design" className="mt-4 inline-block rounded-full bg-coral px-5 py-2.5 text-sm font-black text-white transition hover:bg-coral-dark">
                Need a Design? →
              </Link>
            </div>

            <div className="rounded-3xl bg-ink p-6 text-white">
              <h2 className="text-lg font-black">Printing for…</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {services.map((s) => (
                  <Link key={s.slug} href={`/services/${s.slug}`} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold transition hover:bg-coral">
                    {s.tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand title="Files uploaded? Let's get a quote attached." text="Send your brief alongside your artwork and we will reply with pricing and turnaround." />
    </>
  );
}
