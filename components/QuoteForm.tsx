"use client";

import { useState } from "react";
import { SITE as STATIC_SITE, services as staticServices } from "@/lib/data";
import { whatsappHref, type SiteInfo } from "@/lib/content-utils";

type FormState = {
  name: string;
  phone: string;
  email: string;
  service: string;
  quantity: string;
  deadline: string;
  details: string;
};

const initial: FormState = { name: "", phone: "", email: "", service: "", quantity: "", deadline: "", details: "" };

interface Props {
  /** Live site settings from the database. */
  site?: SiteInfo;
  /** Live services from the database. */
  services?: { slug: string; tag: string }[];
}

export default function QuoteForm({ site = STATIC_SITE, services = staticServices }: Props = {}) {
  const serviceList = services.length ? services : staticServices;
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((err) => ({ ...err, [key]: undefined }));
  };

  const message = [
    "Hello Kabaprints! Quote request:",
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    form.email && `Email: ${form.email}`,
    `Service: ${form.service}`,
    `Quantity: ${form.quantity || "TBC"}`,
    form.deadline && `Deadline: ${form.deadline}`,
    `Details: ${form.details}`,
  ]
    .filter(Boolean)
    .join("\n");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name";
    if (form.phone.trim().length < 7) next.phone = "Enter a phone number we can reach you on";
    if (form.service.trim() === "") next.service = "Choose a service";
    if (form.details.trim().length < 10) next.details = "Tell us a little more about the job (10+ characters)";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) next.email = "That email does not look right";
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (submitted) {
    return (
      <div className="animate-fade-up rounded-3xl bg-white p-7 shadow-xl ring-1 ring-brand/15 sm:p-9">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp/15 text-whatsapp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-7 w-7" aria-hidden="true"><path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-5 text-xl font-black text-ink">Thank you, {form.name.split(" ")[0]}!</h3>
        <p className="mt-2 text-muted">
          Your quote request for <strong className="text-ink">{form.service}</strong> has been prepared.
          Send it straight to our team and we will reply with pricing and turnaround — usually within a few hours.
          We are open {site.hours}, {site.hoursDays}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappHref(site.whatsappNumber, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-sm font-black text-white transition hover:brightness-95"
          >
            Send via WhatsApp →
          </a>
          <a href={`tel:${site.phones[0]?.tel ?? ""}`} className="rounded-full border border-silver-light px-6 py-3 text-sm font-black text-ink transition hover:border-brand hover:text-brand">
            Call {site.phones[0]?.display ?? site.whatsappDisplay}
          </a>
          <button type="button" onClick={() => { setSubmitted(false); setForm(initial); }} className="rounded-full px-4 py-3 text-sm font-bold text-muted hover:text-brand">
            Start another request
          </button>
        </div>
        <pre className="mt-6 whitespace-pre-wrap rounded-2xl bg-cream p-4 text-xs text-ink-soft ring-1 ring-silver-light">{message}</pre>
      </div>
    );
  }

  const field = "w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:bg-white focus:outline-none";
  const label = "block text-xs font-black uppercase tracking-widest text-brand-dark";

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-silver-light sm:p-8">
      <h3 className="text-base font-black text-ink">Request your quote</h3>
      <p className="mt-1 text-sm text-muted">Fill this in and we will get back to you the same day.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="q-name">Full name *</label>
          <input id="q-name" className={`${field} mt-1.5`} value={form.name} onChange={set("name")} placeholder="Adaeze Nwankwo" aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.name}</p>}
        </div>
        <div>
          <label className={label} htmlFor="q-phone">Phone number *</label>
          <input id="q-phone" type="tel" className={`${field} mt-1.5`} value={form.phone} onChange={set("phone")} placeholder="0803 000 0000" aria-invalid={!!errors.phone} />
          {errors.phone && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.phone}</p>}
        </div>
        <div>
          <label className={label} htmlFor="q-email">Email (optional)</label>
          <input id="q-email" type="email" className={`${field} mt-1.5`} value={form.email} onChange={set("email")} placeholder="you@company.com" aria-invalid={!!errors.email} />
          {errors.email && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.email}</p>}
        </div>
        <div>
          <label className={label} htmlFor="q-service">Service *</label>
          <select id="q-service" className={`${field} mt-1.5`} value={form.service} onChange={set("service")} aria-invalid={!!errors.service}>
            <option value="">Select a service…</option>
            {serviceList.map((s) => (
              <option key={s.slug} value={s.tag}>{s.tag}</option>
            ))}
            <option value="Design only">Design only — Need a Design?</option>
            <option value="Not sure">Not sure — please advise</option>
          </select>
          {errors.service && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.service}</p>}
        </div>
        <div>
          <label className={label} htmlFor="q-quantity">Quantity</label>
          <input id="q-quantity" className={`${field} mt-1.5`} value={form.quantity} onChange={set("quantity")} placeholder="e.g. 100 pieces" />
        </div>
        <div>
          <label className={label} htmlFor="q-deadline">Deadline (optional)</label>
          <input id="q-deadline" type="date" className={`${field} mt-1.5`} value={form.deadline} onChange={set("deadline")} />
        </div>
      </div>

      <div className="mt-4">
        <label className={label} htmlFor="q-details">Job details *</label>
        <textarea id="q-details" rows={5} className={`${field} mt-1.5 resize-y`} value={form.details} onChange={set("details")} placeholder="Sizes, colours, material, print positions, delivery location…" aria-invalid={!!errors.details} />
        {errors.details && <p className="mt-1 text-xs font-semibold text-coral-dark">{errors.details}</p>}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-light p-3 text-xs text-brand-dark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" strokeLinecap="round" /></svg>
        Have artwork ready? Upload it on the <a href="/upload" className="font-bold underline">Upload page</a> and mention it in your details.
      </p>

      <button type="submit" className="mt-6 w-full rounded-full bg-coral px-6 py-4 text-sm font-black text-white shadow-lg shadow-coral/25 transition hover:bg-coral-dark">
        Submit quote request
      </button>
      <p className="mt-3 text-center text-xs text-muted">No spam — we only use your details to price your job.</p>
    </form>
  );
}
