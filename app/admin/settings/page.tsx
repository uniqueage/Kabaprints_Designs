import type { Metadata } from "next";
import { Settings as SettingsIcon, Save } from "@/lib/icons";
import { getSiteSettings } from "@/lib/supabase/admin";
import { saveSiteSettingsAction } from "./actions";
import type { SiteSettings } from "@/supabase/lib/types";

export const metadata: Metadata = { title: "Settings · Admin" };

export default async function AdminSettingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const ok = params["ok"];
  const error = params["error"];
  const settings = await getSiteSettings();

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-coral-light border border-coral/30 p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Site settings</h1>
        <p className="mt-1 text-ink-soft">
          Edit the hero, hours, contact details and phones that appear across the site.
        </p>
      </div>

      {settings ? (
        <form action={saveSiteSettingsAction} className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
          <div className="border-b border-silver-light/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-brand" />
              <span className="font-semibold text-ink">General settings</span>
            </div>
          </div>

          <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
            <fieldset className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">
                Branding
              </p>
              <SettingField label="Site name" name="site_name" defaultValue={settings.site_name} />
              <SettingField label="Tagline" name="tagline" defaultValue={settings.tagline} />
              <div className="space-y-1.5">
                <label htmlFor="vision" className="block text-xs font-black uppercase tracking-widest text-brand-dark">
                  Vision / about
                </label>
                <textarea
                  id="vision"
                  name="vision"
                  defaultValue={settings.vision}
                  rows={4}
                  className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none resize-y"
                  required
                />
              </div>
            </fieldset>

            <fieldset className="space-y-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">
                Opening hours
              </p>
              <SettingField label="Hours" name="hours" defaultValue={settings.hours} />
              <SettingField label="Days" name="hours_days" defaultValue={settings.hours_days} />
            </fieldset>

            <fieldset className="space-y-4 pt-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-coral">
                Contact
              </p>
              <SettingField label="WhatsApp number" name="whatsapp_number" defaultValue={settings.whatsapp_number} />
              <SettingField label="Email" name="email" defaultValue={settings.email} type="email" />
            </fieldset>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
            <a href="/admin" className="text-sm font-semibold text-muted transition hover:text-ink">
              Cancel
            </a>
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
        <div className="mt-8 rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm p-8 text-center">
          <SettingsIcon className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm font-semibold text-ink">Site settings not found</p>
          <p className="mt-1 text-sm text-muted">
            Set up the <code className="rounded bg-silver-light px-1 py-0.5 text-xs font-mono">site_settings</code>{" "}
            row first (e.g. by running the schema push).
          </p>
        </div>
      )}
    </div>
  );
}

function SettingField({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-black uppercase tracking-widest text-brand-dark">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none"
        required
      />
    </div>
  );
}
