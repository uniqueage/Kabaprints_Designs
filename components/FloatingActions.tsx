import { getSiteContent } from "@/lib/site-content";
import { whatsappHref } from "@/lib/content-utils";

function WhatsAppIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 9.88 9.89c0 5.45-4.44 9.88-9.89 9.88zm8.42-18.3A11.82 11.82 0 0 0 12.04 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.14 1.59 5.94L.07 24l6.35-1.66a11.85 11.85 0 0 0 5.62 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.24-6.16-3.49-8.41z" />
    </svg>
  );
}

function PhoneIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** Floating WhatsApp + Call buttons, pinned to the bottom-right on every page. */
export default async function FloatingActions() {
  const { site } = await getSiteContent();

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-7 sm:right-6">
      <a
        href={whatsappHref(site.whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-3 rounded-full bg-whatsapp py-3 pl-3 pr-3 text-white shadow-lg shadow-black/20 transition hover:pr-5 sm:pr-4 sm:hover:pr-6"
        aria-label="Chat with Kabaprints on WhatsApp"
      >
        <span className="animate-pulse-ring absolute h-12 w-12 rounded-full bg-whatsapp" aria-hidden="true" />
        <span className="relative"><WhatsAppIcon /></span>
        <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:max-w-[140px] sm:inline">
          Chat on WhatsApp
        </span>
      </a>

      <div className="group relative flex flex-col items-end gap-2">
        <div className="hidden flex-col items-end gap-2 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 group-hover:flex">
          {site.phones.map((p) => (
            <a
              key={p.tel}
              href={`tel:${p.tel}`}
              className="flex items-center gap-2 rounded-lg bg-brand-light px-3 py-2 text-sm font-bold text-brand-dark transition hover:bg-brand hover:text-white"
            >
              <PhoneIcon className="h-4 w-4" />
              {p.display}
            </a>
          ))}
        </div>
        <a
          href={`tel:${site.phones[0]?.tel ?? ""}`}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-black/20 transition hover:bg-brand-dark sm:h-14 sm:w-14"
          aria-label={`Call Kabaprints on ${site.phones[0]?.display ?? ""}`}
        >
          <PhoneIcon className="h-6 w-6" />
        </a>
      </div>
    </div>
  );
}
