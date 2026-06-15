import { useCallback, useMemo, useRef, useState } from "react";
import type { MetaFunction } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
  { title: "ReelDesa — Raw village footage, cinematic quality." },
  {
    name: "description",
    content:
      "Upload a single rough village clip and ReelDesa upscales it to editor-ready, cinematic-grade footage.",
  },
];

// ── Types ────────────────────────────────────────────────────────────────
type Stage = "intake" | "preview" | "enhancing" | "delivered";

interface ClipRecord {
  id: string;
  originalName: string;
  sourceSize: number;
  sourceWidth: number;
  sourceHeight: number;
  durationSeconds: number;
  sourceUrl: string;
  status: string;
  upscaleFactor: number;
  targetGrade?: string;
  targetWidth: number;
  targetHeight: number;
  deliverableName?: string;
  deliverableUrl?: string;
  enhancementNote?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function readVideoMeta(
  file: File,
): Promise<{ width: number; height: number; duration: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const meta = {
        width: v.videoWidth || 0,
        height: v.videoHeight || 0,
        duration: v.duration && isFinite(v.duration) ? v.duration : 0,
      };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, duration: 0 });
    };
    v.src = url;
  });
}

const MAX_BYTES = 20 * 1024 * 1024; // uploader hard cap

// ── Page ─────────────────────────────────────────────────────────────────
export default function IndexPage() {
  const { config, loading } = useConfigurables();

  const appName = config?.appName || "ReelDesa";
  const tagline = config?.tagline || "Raw village footage, cinematic quality.";
  const heroEyebrow = config?.heroEyebrow || "Footage intake & AI upscaling";
  const heroHeadline = config?.heroHeadline || "From rough clip to cinematic grade.";
  const heroSubcopy =
    config?.heroSubcopy ||
    "Drop a single rough village clip. ReelDesa upscales and enhances it to an editor-ready, timeline-ready cut.";
  const uploadCtaLabel = config?.uploadCtaLabel || "Choose a clip";
  const enhanceCtaLabel = config?.enhanceCtaLabel || "Upscale to cinematic";
  const downloadCtaLabel = config?.downloadCtaLabel || "Download editor-ready clip";
  const upscaleFactor = config?.upscaleFactor || 4;
  const targetGrade = config?.targetGrade || "Cinematic 4K";
  const footerNote = config?.footerNote || "ReelDesa — authenticity at cinematic quality.";
  const logoUrl =
    config?.logoUrl && !String(config.logoUrl).startsWith("FILL_") ? config.logoUrl : "";
  const steps =
    config?.steps && config.steps.length
      ? config.steps
      : [
          { title: "Intake", description: "Drop one rough, low-res clip." },
          { title: "Upscale & enhance", description: "Scaled, sharpened, denoised." },
          { title: "Deliver", description: "Download it straight to your timeline." },
        ];

  const [stage, setStage] = useState<Stage>("intake");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localUrl, setLocalUrl] = useState<string>("");
  const [localMeta, setLocalMeta] = useState<{ width: number; height: number; duration: number }>(
    { width: 0, height: 0, duration: 0 },
  );
  const [progress, setProgress] = useState(0);
  const [clip, setClip] = useState<ClipRecord | null>(null);
  const [downloading, setDownloading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const stepIndex = useMemo(() => {
    if (stage === "intake") return 0;
    if (stage === "preview" || stage === "enhancing") return 1;
    return 2;
  }, [stage]);

  const reset = useCallback(() => {
    if (localUrl) URL.revokeObjectURL(localUrl);
    setStage("intake");
    setFile(null);
    setLocalUrl("");
    setLocalMeta({ width: 0, height: 0, duration: 0 });
    setClip(null);
    setError(null);
    setProgress(0);
  }, [localUrl]);

  const handleFile = useCallback(
    async (picked: File) => {
      setError(null);
      if (!picked.type.startsWith("video/")) {
        setError("That's not a video. Drop an .mp4, .mov, or .webm clip.");
        return;
      }
      if (picked.size > MAX_BYTES) {
        setError(`That clip is ${formatBytes(picked.size)}. The limit is 20 MB for this MVP.`);
        return;
      }
      if (localUrl) URL.revokeObjectURL(localUrl);
      const url = URL.createObjectURL(picked);
      const meta = await readVideoMeta(picked);
      setFile(picked);
      setLocalUrl(url);
      setLocalMeta(meta);
      setStage("preview");
    },
    [localUrl],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const picked = e.dataTransfer.files?.[0];
      if (picked) handleFile(picked);
    },
    [handleFile],
  );

  // Upload + enhance pipeline.
  const runPipeline = useCallback(async () => {
    if (!file) return;
    setError(null);
    setStage("enhancing");
    setProgress(8);

    try {
      // 1. Intake — upload the rough source.
      const form = new FormData();
      form.append("file", file);
      form.append("width", String(localMeta.width));
      form.append("height", String(localMeta.height));
      form.append("duration", String(localMeta.duration));
      form.append("upscaleFactor", String(upscaleFactor));
      form.append("targetGrade", targetGrade);

      const tick = window.setInterval(() => {
        setProgress((p) => (p < 72 ? p + Math.random() * 9 : p));
      }, 320);

      const upRes = await fetch("/clips/upload", { method: "POST", body: form });
      const upJson = await upRes.json();
      if (!upRes.ok || !upJson.success) {
        window.clearInterval(tick);
        throw new Error(upJson.message || "Upload failed.");
      }
      const uploaded: ClipRecord = upJson.data;
      setProgress(82);

      // 2. Enhance — upscale & grade.
      const procRes = await fetch(`/clips/${uploaded.id}/process`, { method: "POST" });
      const procJson = await procRes.json();
      window.clearInterval(tick);
      if (!procRes.ok || !procJson.success) {
        throw new Error(procJson.message || "Enhancement failed.");
      }
      setProgress(100);
      setClip(procJson.data);
      // Let the bar reach 100 before the reveal.
      window.setTimeout(() => setStage("delivered"), 480);
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
      setStage("preview");
      setProgress(0);
    }
  }, [file, localMeta, upscaleFactor, targetGrade]);

  // Download with the editor-ready filename.
  const handleDownload = useCallback(async () => {
    if (!clip?.deliverableUrl) return;
    setDownloading(true);
    try {
      const res = await fetch(clip.deliverableUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = clip.deliverableName || "reeldesa-clip.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Try again.");
    } finally {
      setDownloading(false);
    }
  }, [clip]);

  const resGain =
    clip && clip.sourceWidth && clip.targetWidth
      ? Math.round((clip.targetWidth / clip.sourceWidth) * 10) / 10
      : upscaleFactor;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient cinematic wash */}
      <div className="reel-vignette pointer-events-none absolute inset-0" />
      <div className="reel-grain pointer-events-none absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
        {/* Brand */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-border"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                <ReelMark />
              </div>
            )}
            <span className="font-display text-lg font-semibold tracking-tight text-foreground">
              {appName}
            </span>
          </div>
          <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
            {heroEyebrow}
          </span>
        </header>

        {/* Hero */}
        <section className="mt-12 sm:mt-16">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            {tagline}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            {heroHeadline}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {heroSubcopy}
          </p>
        </section>

        {/* Stepper */}
        <Stepper steps={steps} active={stepIndex} />

        {/* Stage card */}
        <section className="mt-7 flex-1">
          {(stage === "intake") && (
            <IntakeDropzone
              loading={loading}
              dragActive={dragActive}
              error={error}
              ctaLabel={uploadCtaLabel}
              onBrowse={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
            />
          )}

          {(stage === "preview" || stage === "enhancing") && file && (
            <PreviewCard
              fileName={file.name}
              size={file.size}
              meta={localMeta}
              localUrl={localUrl}
              enhancing={stage === "enhancing"}
              progress={progress}
              error={error}
              enhanceCtaLabel={enhanceCtaLabel}
              targetGrade={targetGrade}
              upscaleFactor={upscaleFactor}
              onEnhance={runPipeline}
              onReplace={reset}
            />
          )}

          {stage === "delivered" && clip && (
            <DeliverCard
              clip={clip}
              localUrl={localUrl}
              resGain={resGain}
              downloading={downloading}
              downloadCtaLabel={downloadCtaLabel}
              onDownload={handleDownload}
              onAnother={reset}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          {footerNote}
        </footer>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) handleFile(picked);
          e.target.value = "";
        }}
      />
    </main>
  );
}

// ── Stepper ──────────────────────────────────────────────────────────────
function Stepper({
  steps,
  active,
}: {
  steps: { title: string; description: string }[];
  active: number;
}) {
  return (
    <ol className="mt-10 grid grid-cols-3 gap-3">
      {steps.slice(0, 3).map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <li
            key={s.title}
            className={cn(
              "rounded-2xl border p-4 transition-all duration-500",
              current
                ? "border-primary/40 bg-primary/[0.06] shadow-[0_0_0_1px_rgba(224,169,92,0.12)]"
                : done
                  ? "border-secondary/40 bg-secondary/[0.08]"
                  : "border-border bg-card/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold transition-colors duration-500",
                  current
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  current || done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.title}
              </span>
            </div>
            <p className="mt-2 hidden text-xs leading-relaxed text-muted-foreground sm:block">
              {s.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

// ── Intake dropzone ──────────────────────────────────────────────────────
function IntakeDropzone({
  loading,
  dragActive,
  error,
  ctaLabel,
  onBrowse,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  loading: boolean;
  dragActive: boolean;
  error: string | null;
  ctaLabel: string;
  onBrowse: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "reel-bloom group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-16 text-center transition-all duration-300",
        dragActive
          ? "border-primary bg-primary/[0.08] shadow-[0_0_60px_-12px_rgba(224,169,92,0.45)]"
          : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/60",
      )}
    >
      <div
        className={cn(
          "grid h-16 w-16 place-items-center rounded-2xl bg-primary/12 ring-1 ring-primary/25 transition-transform duration-500",
          dragActive && "scale-110",
        )}
      >
        <UploadIcon />
      </div>
      <h2 className="mt-6 font-display text-xl font-semibold text-foreground">
        Drop a rough clip to begin
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        One clip at a time. MP4, MOV, or WebM up to 20&nbsp;MB. We&apos;ll read its resolution,
        size, and length on intake.
      </p>
      <button
        type="button"
        onClick={onBrowse}
        disabled={loading}
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {ctaLabel}
      </button>
      {error && <p className="mt-5 text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

// ── Preview / enhance card ───────────────────────────────────────────────
function PreviewCard({
  fileName,
  size,
  meta,
  localUrl,
  enhancing,
  progress,
  error,
  enhanceCtaLabel,
  targetGrade,
  upscaleFactor,
  onEnhance,
  onReplace,
}: {
  fileName: string;
  size: number;
  meta: { width: number; height: number; duration: number };
  localUrl: string;
  enhancing: boolean;
  progress: number;
  error: string | null;
  enhanceCtaLabel: string;
  targetGrade: string;
  upscaleFactor: number;
  onEnhance: () => void;
  onReplace: () => void;
}) {
  const targetW = meta.width ? meta.width * upscaleFactor : 0;
  const targetH = meta.height ? meta.height * upscaleFactor : 0;
  return (
    <div className="reel-bloom overflow-hidden rounded-3xl border border-border bg-card/60">
      <div className="relative aspect-video w-full bg-black">
        {localUrl && (
          <video
            src={localUrl}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
          Source
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <p className="truncate font-medium text-foreground" title={fileName}>
          {fileName}
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Resolution" value={meta.width ? `${meta.width}×${meta.height}` : "—"} />
          <Stat label="Duration" value={formatDuration(meta.duration)} />
          <Stat label="Size" value={formatBytes(size)} />
        </dl>

        <div className="mt-5 flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm">
          <SparkIcon />
          <span className="text-muted-foreground">
            Target:{" "}
            <span className="font-mono-stat font-medium text-foreground">
              {targetW ? `${targetW}×${targetH}` : targetGrade}
            </span>{" "}
            · {upscaleFactor}× · {targetGrade}
          </span>
        </div>

        {enhancing ? (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Upscaling & enhancing…</span>
              <span className="font-mono-stat text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="reel-shimmer mt-3 h-1 w-full rounded-full" />
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onEnhance}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            >
              <SparkIcon /> {enhanceCtaLabel}
            </button>
            <button
              type="button"
              onClick={onReplace}
              className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Replace clip
            </button>
          </div>
        )}

        {error && <p className="mt-4 text-sm font-medium text-destructive">{error}</p>}
      </div>
    </div>
  );
}

// ── Deliver card ─────────────────────────────────────────────────────────
function DeliverCard({
  clip,
  localUrl,
  resGain,
  downloading,
  downloadCtaLabel,
  onDownload,
  onAnother,
}: {
  clip: ClipRecord;
  localUrl: string;
  resGain: number;
  downloading: boolean;
  downloadCtaLabel: string;
  onDownload: () => void;
  onAnother: () => void;
}) {
  return (
    <div className="reel-bloom overflow-hidden rounded-3xl border border-primary/30 bg-card/70 shadow-[0_0_80px_-30px_rgba(224,169,92,0.5)]">
      <div className="relative aspect-video w-full bg-black">
        <video
          src={clip.deliverableUrl || localUrl}
          controls
          playsInline
          className="h-full w-full object-contain"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground backdrop-blur">
          {clip.targetGrade || "Cinematic"}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-secondary-foreground">
            ✓
          </span>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Editor-ready, timeline-ready.
          </h2>
        </div>
        {clip.enhancementNote && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {clip.enhancementNote}
          </p>
        )}

        {/* Before / after */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-background/40 p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Source
            </p>
            <p className="mt-1 font-mono-stat text-lg font-semibold text-foreground">
              {clip.sourceWidth ? `${clip.sourceWidth}×${clip.sourceHeight}` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
              Cinematic
            </p>
            <p className="mt-1 font-mono-stat text-lg font-semibold text-foreground">
              {clip.targetWidth ? `${clip.targetWidth}×${clip.targetHeight}` : clip.targetGrade}
            </p>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          <span className="font-mono-stat font-semibold text-primary">{resGain}×</span> resolution
          gained
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-70"
          >
            <DownloadIcon /> {downloading ? "Preparing…" : downloadCtaLabel}
          </button>
          <button
            type="button"
            onClick={onAnother}
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Enhance another
          </button>
        </div>

        {clip.deliverableName && (
          <p className="mt-4 truncate text-center font-mono-stat text-xs text-muted-foreground">
            {clip.deliverableName}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stat ─────────────────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono-stat text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────
function ReelMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <circle cx="12" cy="6.4" r="1.4" fill="currentColor" />
      <circle cx="12" cy="17.6" r="1.4" fill="currentColor" />
      <circle cx="6.4" cy="12" r="1.4" fill="currentColor" />
      <circle cx="17.6" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path
        d="M12 16V4m0 0l-4 4m4-4l4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="currentColor"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
      <path
        d="M12 4v10m0 0l-3.5-3.5M12 14l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18h14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
