import type { Metadata } from "next";
import Link from "next/link";
import { Save, Settings as SettingsIcon } from "@/lib/icons";
import { getSiteSettings } from "@/lib/supabase/admin";
import { saveSiteSettingsAction } from "./actions";
import { DEFAULT_HOURS, DEFAULT_HOURS_DAYS } from "@/lib/content-utils";

export const metadata: Metadata = { title: "Settings · Admin" };

/** Number of phone rows the editor shows (existing numbers are prefilled). */
const PHONE_ROWS = 4;

const field =
  "w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none";
const label = "block text-xs font-black uppercase tracking-widest text-brand-dark";

function SettingField({
  label: fieldLabel,
  name,
  defaultValue,
  type = "text",
  help,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  help?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className={label}>
        {fieldLabel}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={field}
        required
      />
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const query = await searchParams;
  const ok = query["ok"];
  const error = query["error"];

  let settings = null;
  let loadError: string | undefined;
  try {
    settings = await getSiteSettings();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not read the site settings row.";
  }

  const phones = settings?.phones_json ?? [];
  const rows = Array.from({ length: Math.max(PHONE_ROWS, phones.length) }, (_, i) => ({
    display: phones[i]?.display ?? "",
    tel: phones[i]?.tel ?? "",
  }));

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-coral/30 bg-coral-light p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Site settings</h1>
        <p className="mt-1 text-ink-soft">
          Brand name, vision, opening hours, phone numbers, WhatsApp and email. Everything here is shown across the
          public site and updates it the moment you save.
        </p>
      </div>

      {loadError && (
        <div className="mt-5 rounded-xl border border-coral/30 bg-coral-light p-4 text-sm text-coral-dark">
          <p className="font-black">Could not load settings</p>
          <p className="mt-1">{loadError}</p>
          <p className="mt-1">
            If the <code className="rounded bg-white/60 px-1 font-mono text-xs">site_settings</code> table is missing,
            run the schema push from{" "}
            <Link href="/api/supabase/push" className="font-bold underline">
              /api/supabase/push
            </Link>
            .
          </p>
        </div>
      )}

      {settings ? (
        <form
          action={saveSiteSettingsAction}
          className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm"
        >
          <div className="border-b border-silver-light/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-brand" />
              <span className="font-semibold text-ink">General settings</span>
            </div>
          </div>

          <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
            <fieldset className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">Branding</p>
              <SettingField label="Site name" name="site_name" defaultValue={settings.site_name} />
              <SettingField label="Tagline" name="tagline" defaultValue={settings.tagline} />
              <div className="space-y-1.5">
                <label htmlFor="vision" className={label}>
                  Vision / about
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  defaultValue={settings.vision}
                  rows={4}
                  className={`${field} resize-y`}
                  required
                />
                <p className="text-xs text-muted">Shown in the large quote block on the home page.</p>
              </div>
            </fieldset>

            <fieldset className="space-y-4 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">Opening hours</p>
              <SettingField
                label="Hours"
                name="hours"
                defaultValue={settings.hours}
                placeholder={DEFAULT_HOURS}
                help={`The shop is open around the clock — keep this as “${DEFAULT_HOURS}” unless that changes.`}
              />
              <SettingField
                label="Days"
                name="hours_days"
                defaultValue={settings.hours_days}
                placeholder={DEFAULT_HOURS_DAYS}
                help={`Recommended: “${DEFAULT_HOURS_DAYS}”.`}
              />
            </fieldset>

            <fieldset className="space-y-4 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">Contact</p>
              <SettingField
                label="WhatsApp number"
                name="whatsapp_number"
                defaultValue={settings.whatsapp_number}
                help="Digits only, with country code — e.g. 2348032961171. Used for every WhatsApp button."
              />
              <SettingField label="Email" name="email" defaultValue={settings.email} type="email" />
            </fieldset>

            <fieldset className="space-y-4 pt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">Phone numbers</p>
              <p className="text-xs text-muted">
                Shown in the header bar, footer, contact page, quote page and the floating call button. Leave a row
                blank to hide it. The first row is the number used by the floating call button.
              </p>
              <div className="space-y-3">
                {rows.map((row, i) => (
                  <div key={i} className="grid gap-3 sm:grid-cols-[1fr_1fr]">
                    <div className="space-y-1.5">
                      <label htmlFor={`phone_display_${i}`} className={label}>
                        Number {i + 1} — display
                      </label>
                      <input
                        id={`phone_display_${i}`}
                        name="phone_display"
                        type="text"
                        defaultValue={row.display}
                        placeholder="0803 296 1171"
                        className={field}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`phone_tel_${i}`} className={label}>
                        Number {i + 1} — call link
                      </label>
                      <input
                        id={`phone_tel_${i}`}
                        name="phone_tel"
                        type="tel"
                        defaultValue={row.tel}
                        placeholder="+2348032961171"
                        className={field}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
            <Link href="/admin" className="text-sm font-semibold text-muted transition hover:text-ink">
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              <Save className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </form>
      ) : (
        !loadError && (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center ring-1 ring-silver-light/60 shadow-sm">
            <SettingsIcon className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 text-sm font-semibold text-ink">Site settings not found</p>
            <p className="mt-1 text-sm text-muted">
              Set up the <code className="rounded bg-silver-light px-1 py-0.5 font-mono text-xs">site_settings</code>{" "}
              row first (e.g. by running the schema push).
            </p>
          </div>
        )
      )}
    </div>
  );
}
