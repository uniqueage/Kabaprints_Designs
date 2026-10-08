import Link from "next/link";
import Logo from "./Logo";
import { SITE, services, whatsappLink } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size="sm" light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              A marketing and printing agency specialising in advert production — quality work,
              honest pricing and fast turnaround.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.04 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.14 1.59 5.94L.07 24l6.35-1.66a11.85 11.85 0 0 0 5.62 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.16-3.49-8.41z" /></svg>
              </a>
              <a href={`tel:${SITE.phones[0].tel}`} aria-label="Call us" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
              <a href={`mailto:${SITE.email}`} aria-label="Email us" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-coral">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></svg>
              </a>
            </div>
          </div>

          <nav aria-label="Services">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-coral">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="transition hover:text-white">{s.tag}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-coral">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/70">
              <li><Link href="/" className="transition hover:text-white">Home</Link></li>
              <li><Link href="/portfolio" className="transition hover:text-white">Portfolio — Kabaprints Works</Link></li>
              <li><Link href="/design" className="transition hover:text-white">Need a Design?</Link></li>
              <li><Link href="/upload" className="transition hover:text-white">Upload Your Design</Link></li>
              <li><Link href="/quote" className="transition hover:text-white">Get a Quote</Link></li>
              <li><Link href="/search" className="transition hover:text-white">Search</Link></li>
              <li><Link href="/sign-in" className="transition hover:text-white">Sign In</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-coral">Open Hours</h3>
            <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="flex items-center gap-2 font-bold text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-coral" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>
                {SITE.hours}
              </p>
              <p className="mt-1 text-sm text-white/70">{SITE.hoursDays}</p>
              <p className="mt-3 text-xs text-white/50">Sunday: Closed · Public holidays: by appointment</p>
            </div>
            <h3 className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-coral">Call / WhatsApp</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {SITE.phones.map((p) => (
                <li key={p.tel} className="flex items-center gap-2 text-white/80">
                  <a href={`tel:${p.tel}`} className="font-semibold transition hover:text-coral">{p.display}</a>
                  <a href={whatsappLink(`Hello Kabaprints! I'm reaching out from ${p.display}.`)} target="_blank" rel="noopener noreferrer" className="text-xs text-whatsapp hover:underline">WhatsApp</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kabaprints · Printshop + Design. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed &amp; printed with care.</p>
        </div>
      </div>
    </footer>
  );
}
