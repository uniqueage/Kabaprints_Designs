"use client";

import { useRef, useState } from "react";
import { SITE as STATIC_SITE } from "@/lib/data";
import { whatsappHref, type SiteInfo } from "@/lib/content-utils";

const SUPPORTED = [".png", ".jpg", ".jpeg", ".pdf", ".svg"];
const SUPPORTED_LABELS = [
  { ext: "PNG", note: "Raster, transparent background" },
  { ext: "JPG / JPEG", note: "Photos & full-colour art" },
  { ext: "PDF", note: "Press-ready with bleed" },
  { ext: "SVG", note: "Vector — best for logos" },
];
const MAX_BYTES = 25 * 1024 * 1024;

type UploadFile = {
  id: string;
  name: string;
  size: number;
  ext: string;
  progress: number;
  status: "ready" | "uploading" | "done";
};

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface Props {
  /** Live site settings from the database. */
  site?: SiteInfo;
}

export default function UploadDropzone({ site = STATIC_SITE }: Props = {}) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const accepted: UploadFile[] = [];
    const rejected: string[] = [];

    Array.from(list).forEach((file) => {
      const ext = extOf(file.name);
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      if (!SUPPORTED.includes(ext)) {
        rejected.push(`${file.name} — unsupported type (use PNG, JPG/JPEG, PDF or SVG)`);
        return;
      }
      if (file.size > MAX_BYTES) {
        rejected.push(`${file.name} — larger than 25 MB`);
        return;
      }
      accepted.push({ id, name: file.name, size: file.size, ext, progress: 0, status: "ready" });
    });

    if (accepted.length) setFiles((f) => [...f, ...accepted]);
    setNotice(rejected.length ? rejected.join(" · ") : null);
  }

  function startUpload() {
    if (!files.some((f) => f.status === "ready")) return;
    setFiles((f) => f.map((x) => (x.status === "ready" ? { ...x, status: "uploading" as const } : x)));

    // Simulated upload progress — swap for a POST to your storage endpoint when a backend exists.
    const timer = setInterval(() => {
      setFiles((f) => {
        const next = f.map((file) => {
          if (file.status !== "uploading") return file;
          const p = Math.min(100, file.progress + 12 + Math.random() * 16);
          return { ...file, progress: p, status: p >= 100 ? ("done" as const) : ("uploading" as const) };
        });
        if (next.every((x) => x.status !== "uploading")) clearInterval(timer);
        return next;
      });
    }, 260);
  }

  const pendingCount = files.filter((f) => f.status !== "done").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
        role="button"
        tabIndex={0}
        aria-label="Upload your design files"
        className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
          dragging ? "border-coral bg-coral-light" : "border-brand/30 bg-brand-light/50 hover:border-brand hover:bg-brand-light"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf,.svg,image/png,image/jpeg,application/pdf,image/svg+xml"
          className="sr-only"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/25">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
            <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-8-8-4-4m0 0L8 8m4-4v12" />
          </svg>
        </span>
        <h3 className="mt-5 text-xl font-black text-ink">Drag &amp; drop your design here</h3>
        <p className="mt-2 text-sm text-muted">or <span className="font-bold text-brand">browse files</span> from your device · max 25 MB each</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUPPORTED_LABELS.map((s) => (
            <span key={s.ext} className="rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-brand-dark ring-1 ring-silver-light">
              {s.ext}
            </span>
          ))}
        </div>
      </div>

      {notice && (
        <p role="alert" className="mt-3 rounded-xl bg-coral-light p-3 text-xs font-semibold text-coral-dark">
          {notice}
        </p>
      )}

      {files.length > 0 && (
        <div className="mt-5 overflow-hidden rounded-3xl bg-white ring-1 ring-silver-light">
          <div className="flex items-center justify-between border-b border-silver-light px-5 py-3">
            <h4 className="text-sm font-black text-ink">{files.length} file{files.length > 1 ? "s" : ""} selected</h4>
            <button type="button" onClick={() => setFiles([])} className="text-xs font-bold text-muted hover:text-coral-dark">Clear all</button>
          </div>
          <ul className="divide-y divide-silver-light">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[10px] font-black uppercase ${
                  f.status === "done" ? "bg-whatsapp/15 text-whatsapp" : "bg-brand-light text-brand-dark"
                }`}>
                  {f.ext.replace(".", "").slice(0, 4)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{f.name}</p>
                  <p className="text-xs text-muted">
                    {fmtSize(f.size)}
                    {f.status === "uploading" && ` · uploading ${Math.round(f.progress)}%`}
                    {f.status === "done" && " · uploaded ✓"}
                    {f.status === "ready" && " · ready"}
                  </p>
                  {f.status === "uploading" && (
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-silver-light">
                      <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFiles((list) => list.filter((x) => x.id !== f.id))}
                  aria-label={`Remove ${f.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-coral-light hover:text-coral-dark"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" /></svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 border-t border-silver-light bg-cream px-5 py-4">
            <button
              type="button"
              onClick={startUpload}
              disabled={pendingCount === 0}
              className="rounded-full bg-brand px-6 py-3 text-sm font-black text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pendingCount > 0 ? `Upload ${pendingCount} file${pendingCount > 1 ? "s" : ""}` : "All files uploaded ✓"}
            </button>
            {doneCount > 0 && (
              <a
                href={whatsappHref(site.whatsappNumber, `Hello Kabaprints! I have uploaded ${doneCount} design file(s) for printing: ${files.filter((f) => f.status === "done").map((f) => f.name).join(", ")}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-whatsapp px-6 py-3 text-sm font-black text-white transition hover:brightness-95"
              >
                Notify us on WhatsApp →
              </a>
            )}
            <p className="text-xs text-muted">We confirm every file by WhatsApp before printing.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {SUPPORTED_LABELS.map((s) => (
          <div key={s.ext} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-silver-light">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-xs font-black text-white">{s.ext.split(" ")[0]}</span>
            <span>
              <span className="block text-sm font-bold text-ink">{s.ext}</span>
              <span className="block text-xs text-muted">{s.note}</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-2xl bg-cream p-4 text-xs leading-relaxed text-muted ring-1 ring-silver-light">
        Tips for the crispest print: vector (SVG) or PDF at 300 DPI with 3mm bleed and fonts outlined.
        Need help preparing your file? <a href={whatsappHref(site.whatsappNumber, "Hello Kabaprints! Please help me prepare my artwork for printing.")} target="_blank" rel="noopener noreferrer" className="font-bold text-brand hover:underline">Ask us on WhatsApp</a> or call {site.phones[0]?.display ?? site.whatsappDisplay}.
      </p>
    </div>
  );
}
