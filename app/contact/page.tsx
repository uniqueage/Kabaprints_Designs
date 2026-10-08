import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import CtaBand from "@/components/CtaBand";
import { SITE, whatsappLink } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact & Open Hours",
  description: "Call or WhatsApp Kabaprints — open 9:00 am to 7:00 pm, Mondays to Saturdays.",
};

const includes = [
  "The service you need (transfer, screen, banners, branding…)",
  "Quantity, sizes and colours",
  "Your deadline and delivery location",
  "Artwork file, or a link to your brief",
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-brand-deep py-14 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-white/60">
            <Link href="/" className="hover:text-coral">Home</Link> <span className="mx-1">/</span> <span className="text-white">Contact</span>
          </nav>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Let&apos;s talk printing</h1>
          <p className="mt-3 max-w-2xl text-white/75">
            Call, WhatsApp or send a quote request — real people answer during opening hours.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            <Reveal>
              <div className="flex h-full flex-col rounded-3xl bg-white p-7 ring-1 ring-silver-light">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <h2 className="mt-4 text-lg font-black text-ink">Call us</h2>
                <div className="mt-3 space-y-2">
                  {SITE.phones.map((p) => (
                    <a key={p.tel} href={`tel:${p.tel}`} className="block rounded-xl bg-cream px-4 py-3 text-sm font-bold text-ink ring-1 ring-silver-light transition hover:bg-brand hover:text-white hover:ring-brand">
                      {p.display}
                    </a>
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted">Lines are busiest 10am–1pm. Voicemails are returned the same day.</p>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="flex h-full flex-col rounded-3xl bg-whatsapp/10 p-7 ring-1 ring-whatsapp/30">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-whatsapp text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.04 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.14 1.59 5.94L.07 24l6.35-1.66a11.85 11.85 0 0 0 5.62 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.16-3.49-8.41z" /></svg>
                </span>
                <h2 className="mt-4 text-lg font-black text-ink">WhatsApp {SITE.whatsappDisplay}</h2>
                <p className="mt-2 text-sm text-ink-soft">Fastest way to send photos, sizes and get a same-day quote.</p>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block rounded-full bg-whatsapp px-5 py-3 text-center text-sm font-black text-white transition hover:brightness-95">
                  Start chatting →
                </a>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="flex h-full flex-col rounded-3xl bg-brand p-7 text-white">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                </span>
                <h2 className="mt-4 text-lg font-black">Open hours</h2>
                <p className="mt-3 text-4xl font-black">{SITE.hours}</p>
                <p className="text-white/85">{SITE.hoursDays}</p>
                <p className="mt-4 text-sm text-white/60">Sunday: Closed. Online orders and uploads are accepted any time — processed from the next working day.</p>
                <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs text-white/80">
                  Walk-ins welcome — bring your design on a flash drive or send it ahead via the Upload page.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl bg-white p-7 ring-1 ring-silver-light">
                <h2 className="text-xl font-black text-ink">Email</h2>
                <a href={`mailto:${SITE.email}`} className="mt-2 inline-block text-lg font-bold text-brand hover:underline">{SITE.email}</a>
                <p className="mt-3 text-sm text-muted">
                  Great for artwork, PO numbers and long briefs. We reply within one working day.
                </p>
                <a href={`mailto:${SITE.email}?subject=Print%20enquiry`} className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-brand">
                  Compose email →
                </a>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="h-full rounded-3xl bg-cream p-7 ring-1 ring-silver-light">
                <h2 className="text-xl font-black text-ink">What to include in your message</h2>
                <ul className="mt-4 space-y-3">
                  {includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-ink-soft">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral text-[10px] font-black text-white">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/quote" className="mt-5 inline-block rounded-full bg-coral px-6 py-3 text-sm font-black text-white transition hover:bg-coral-dark">
                  Use the quote form instead →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
