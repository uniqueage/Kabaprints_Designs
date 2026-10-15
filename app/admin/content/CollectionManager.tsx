"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_MIME_TYPES, resolveImage } from "@/lib/content-utils";
import { Edit, Plus, Save, Trash2 } from "@/lib/icons";
import type { CollectionDef, FieldDef } from "./collections";
import { deleteCollectionItemAction, saveCollectionItemAction } from "./actions";

export interface ServiceOption {
  value: string;
  label: string;
}

interface Props {
  def: CollectionDef;
  items: Record<string, unknown>[];
  serviceOptions: ServiceOption[];
  ok?: string;
  error?: string;
}

const inputClass =
  "w-full rounded-xl border border-silver-light bg-cream px-4 py-3 text-sm focus:border-brand focus:bg-white focus:outline-none";
const labelClass = "block text-xs font-black uppercase tracking-widest text-brand-dark";

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join("\n");
  return String(value);
}

/**
 * List + inline editor for one content collection.
 *
 * A single component drives every section (services, portfolio, before/after,
 * testimonials, hero slides and the quote/design reference lists) using the
 * field definitions in `collections.ts`.
 */
export default function CollectionManager({ def, items, serviceOptions, ok, error }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const toggle = (id: string) => {
    setAdding(false);
    setOpenId((current) => (current === id ? null : id));
  };

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

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{def.label}</h1>
          <p className="mt-1 text-ink-soft">{def.description}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
          {def.note && (
            <p className="mt-2 rounded-xl bg-brand-light px-3 py-2 text-xs font-semibold text-brand-dark">
              {def.note}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setOpenId(null);
            setAdding((v) => !v);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" />
          {adding ? "Close" : `Add ${def.singular}`}
        </button>
      </div>

      {adding && (
        <form
          action={saveCollectionItemAction}
          className="mt-6 overflow-hidden rounded-2xl border border-brand/30 bg-white shadow-sm"
        >
          <input type="hidden" name="__collection" value={def.slug} />
          <div className="border-b border-silver-light/60 bg-brand-light/50 px-5 py-4">
            <h2 className="text-lg font-black text-ink">New {def.singular}</h2>
          </div>
          <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
            {def.fields.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value=""
                idPrefix={`new-${field.name}`}
                serviceOptions={serviceOptions}
              />
            ))}
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm font-semibold text-muted transition hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" />
              Add {def.singular}
            </button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-silver-light/60 shadow-sm">
          <p className="text-sm font-semibold text-ink">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted">
            Use “Add {def.singular}” above. Until something is saved the site keeps its built-in defaults.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => {
            const id = text(item.id);
            const isOpen = openId === id;
            return (
              <li key={id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  {def.imageFields?.[0] && <Thumbnail src={text(item[def.imageFields[0]])} />}
                  {def.colorField && (
                    <span
                      className="mt-0.5 h-10 w-10 shrink-0 rounded-lg ring-1 ring-black/10"
                      style={{ backgroundColor: text(item[def.colorField]) || "#ffffff" }}
                      aria-hidden="true"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{text(item[def.titleField]) || "Untitled"}</p>
                    {def.subtitleField && (
                      <p className="mt-0.5 line-clamp-2 text-sm text-muted">{text(item[def.subtitleField])}</p>
                    )}
                    <p className="mt-1 font-mono text-[11px] text-muted">order {text(item.ordinal) || "0"}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-silver-light px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-brand hover:bg-brand-light hover:text-brand-dark"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      {isOpen ? "Close" : "Edit"}
                    </button>
                    <form
                      action={deleteCollectionItemAction}
                      onSubmit={(e) => {
                        if (!window.confirm(`Delete “${text(item[def.titleField]) || def.singular}”? This cannot be undone.`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <input type="hidden" name="__collection" value={def.slug} />
                      <input type="hidden" name="__id" value={id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-silver-light px-2.5 py-1.5 text-xs font-semibold text-coral-dark transition hover:border-coral hover:bg-coral-light"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {isOpen && (
                  <form action={saveCollectionItemAction} className="border-t border-silver-light/60">
                    <input type="hidden" name="__collection" value={def.slug} />
                    <input type="hidden" name="__id" value={id} />
                    <div className="divide-y divide-silver-light/40 px-5 py-4 sm:px-6">
                      {def.fields.map((field) => (
                        <FieldInput
                          key={field.name}
                          field={field}
                          value={item[field.name]}
                          idPrefix={`${id}-${field.name}`}
                          serviceOptions={serviceOptions}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-end gap-3 border-t border-silver-light/60 bg-cream/50 px-5 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        className="text-sm font-semibold text-muted transition hover:text-ink"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                      >
                        <Save className="h-4 w-4" />
                        Save changes
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Thumbnail({ src }: { src: string }) {
  const url = resolveImage(src);
  return (
    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-silver-light/50 ring-1 ring-silver-light">
      {url ? (
        <Image src={url} alt="" fill className="object-cover" sizes="80px" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">No image</span>
      )}
    </div>
  );
}

function FieldInput({
  field,
  value,
  idPrefix,
  serviceOptions,
}: {
  field: FieldDef;
  value: unknown;
  idPrefix: string;
  serviceOptions: ServiceOption[];
}) {
  const inputId = `f-${idPrefix}`;
  const current = text(value);

  return (
    <div className="space-y-1.5 py-4 first:pt-0 last:pb-0">
      <label htmlFor={inputId} className={labelClass}>
        {field.label}
        {field.required ? " *" : ""}
      </label>

      {field.type === "textarea" && (
        <textarea
          id={inputId}
          name={field.name}
          rows={field.rows ?? 3}
          required={field.required}
          defaultValue={current}
          placeholder={field.placeholder}
          className={`${inputClass} resize-y`}
        />
      )}

      {field.type === "lines" && (
        <textarea
          id={inputId}
          name={field.name}
          rows={field.rows ?? 3}
          defaultValue={current}
          placeholder={field.placeholder ?? "One item per line"}
          className={`${inputClass} resize-y`}
        />
      )}

      {field.type === "select" && (
        <select id={inputId} name={field.name} required={field.required} defaultValue={current} className={inputClass}>
          <option value="">Select…</option>
          {serviceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "image" && <ImageField field={field} inputId={inputId} value={current} />}

      {field.type === "color" && <ColorField field={field} inputId={inputId} value={current} />}

      {(field.type === "text" || field.type === "number") && (
        <input
          id={inputId}
          name={field.name}
          type={field.type === "number" ? "number" : "text"}
          required={field.required}
          min={field.min}
          max={field.max}
          defaultValue={current}
          placeholder={field.placeholder}
          className={inputClass}
        />
      )}

      {field.help && <p className="text-xs text-muted">{field.help}</p>}
    </div>
  );
}

function ImageField({ field, inputId, value }: { field: FieldDef; inputId: string; value: string }) {
  const [current, setCurrent] = useState(value);
  const preview = resolveImage(current);

  return (
    <div className="grid gap-4 sm:grid-cols-[120px_1fr] sm:items-start">
      <div className="relative h-[88px] w-[120px] overflow-hidden rounded-xl bg-silver-light/50 ring-1 ring-silver-light">
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" sizes="120px" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">No image</span>
        )}
      </div>
      <div className="space-y-2">
        <input
          id={inputId}
          name={field.name}
          type="text"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder={field.placeholder ?? "/images/tshirt.svg"}
          className={`${inputClass} font-mono text-xs`}
        />
        <input
          type="file"
          name={`${field.name}_file`}
          accept={IMAGE_MIME_TYPES.join(",")}
          className="w-full rounded-xl border border-silver-light bg-cream px-3 py-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-brand file:px-3.5 file:py-1.5 file:text-xs file:font-bold file:text-white focus:border-brand focus:bg-white focus:outline-none"
        />
        <p className="text-xs text-muted">
          Type a path (e.g. <code className="rounded bg-silver-light px-1 font-mono">/images/tshirt.svg</code>) or upload a
          file — an upload replaces the path above.
        </p>
      </div>
    </div>
  );
}

function ColorField({ field, inputId, value }: { field: FieldDef; inputId: string; value: string }) {
  const [current, setCurrent] = useState(value);
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(current.trim());

  return (
    <div className="flex items-center gap-3">
      <span
        className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-black/10"
        style={{ backgroundColor: valid ? current : "#ffffff" }}
        aria-hidden="true"
      />
      <input
        id={inputId}
        name={field.name}
        type="text"
        required={field.required}
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="#1E6FA9"
        className={`${inputClass} max-w-xs font-mono`}
      />
    </div>
  );
}
