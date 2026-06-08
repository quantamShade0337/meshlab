"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Image as ImageIcon,
  Clipboard,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAMPLE_SOURCE_IMAGE } from "@/lib/sample-data";

// ── Types ──────────────────────────────────────────────────────────────────

type Quality = "fast" | "balanced" | "detailed";
type Style = "original" | "clean" | "stylised";
type BgMode = "transparent" | "white" | "black";
type IntendedUse = "design" | "game" | "ar" | "print" | "other";

interface UploadedFile {
  dataUrl: string;
  rawFile: File | null;
  name: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";
  size: number;
  width: number;
  height: number;
  fingerprint: string;
  isSample: boolean;
}

interface WizardSettings {
  modelName: string;
  quality: Quality;
  style: Style;
  textures: boolean;
  background: BgMode;
  symmetry: boolean;
  intendedUse: IntendedUse;
  faceLimit: string;
}

const DEFAULT_SETTINGS: WizardSettings = {
  modelName: "",
  quality: "balanced",
  style: "original",
  textures: true,
  background: "transparent",
  symmetry: false,
  intendedUse: "design",
  faceLimit: "10000",
};

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 20 * 1024 * 1024;
const MIN_DIM = 512;

interface ProviderCapabilities {
  textures: boolean;
  polygonTargeting: boolean;
  cancellation: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function validateImageFile(
  file: File
): Promise<{ ok: boolean; width?: number; height?: number; error?: string }> {
  return new Promise((resolve) => {
    if (!ACCEPTED.includes(file.type)) {
      return resolve({ ok: false, error: "Only PNG, JPEG, and WEBP are accepted." });
    }
    if (file.size > MAX_BYTES) {
      return resolve({ ok: false, error: "File must be under 20 MB." });
    }
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < MIN_DIM || img.height < MIN_DIM) {
        resolve({
          ok: false,
          error: `Image must be at least ${MIN_DIM}×${MIN_DIM} px (got ${img.width}×${img.height}).`,
        });
      } else {
        resolve({ ok: true, width: img.width, height: img.height });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, error: "Could not read the image file." });
    };
    img.src = url;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function fingerprintFile(file: Blob) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// ── Step indicator ─────────────────────────────────────────────────────────

const STEPS = ["Upload", "Settings", "Review"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-0" aria-label="Wizard steps">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors",
                  done
                    ? "bg-[#0a0a0a] text-white"
                    : active
                    ? "bg-[#0070f3] text-white"
                    : "bg-[#f5f5f5] text-[#737373]",
                ].join(" ")}
                aria-current={active ? "step" : undefined}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm ${active ? "font-medium text-[#0a0a0a]" : done ? "text-[#0a0a0a]" : "text-[#737373]"}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight size={14} className="mx-3 text-[#d4d4d4]" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Step 1: Upload ─────────────────────────────────────────────────────────

function UploadStep({
  file,
  onFile,
  onNext,
}: {
  file: UploadedFile | null;
  onFile: (f: UploadedFile | null) => void;
  onNext: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const f = fileList[0];
      const result = await validateImageFile(f);
      if (!result.ok) {
        setError(result.error ?? "Invalid file.");
        return;
      }
      setError(null);
      const [dataUrl, fingerprint] = await Promise.all([
        fileToDataUrl(f),
        fingerprintFile(f),
      ]);
      onFile({
        dataUrl,
        rawFile: f,
        name: f.name,
        mimeType: f.type as UploadedFile["mimeType"],
        size: f.size,
        width: result.width!,
        height: result.height!,
        fingerprint,
        isSample: false,
      });
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items);
      const imgItem = items.find((i) => i.type.startsWith("image/"));
      if (!imgItem) return;
      const blob = imgItem.getAsFile();
      if (blob) {
        const dt = new DataTransfer();
        dt.items.add(blob);
        handleFiles(dt.files);
      }
    },
    [handleFiles]
  );

  const useSample = () => {
    setError(null);
    onFile({
      dataUrl: SAMPLE_SOURCE_IMAGE,
      rawFile: null,
      name: "arc-chair-sample.svg",
      mimeType: "image/svg+xml",
      size: new TextEncoder().encode(SAMPLE_SOURCE_IMAGE).byteLength,
      width: 512,
      height: 512,
      fingerprint: "sample-arc-chair-000000000000000000000000000000000000000000000000",
      isSample: true,
    });
  };

  return (
    <div>
      <h2 className="text-base font-semibold text-[#0a0a0a] mb-1">Upload a reference image</h2>
      <p className="text-sm text-[#737373] mb-6">
        PNG, JPEG, or WEBP · max 20 MB · minimum 512×512 px
      </p>

      {file ? (
        <div className="border border-[#e5e5e5] rounded-lg p-4 flex items-start gap-4">
          {/* Preview */}
          <div className="w-20 h-20 rounded bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.dataUrl}
              alt="Upload preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0a0a0a] truncate">{file.name}</p>
            {file.isSample && (
              <p className="text-xs text-[#737373] mt-0.5">Sample image</p>
            )}
          </div>
          <button
            onClick={() => onFile(null)}
            className="text-[#737373] hover:text-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 rounded"
            aria-label="Remove uploaded image"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
          role="button"
          aria-label="Drop zone — drag and drop an image, or press Enter to choose a file"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
          className={[
            "border-2 border-dashed rounded-lg p-12 flex flex-col items-center gap-3 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2",
            dragging
              ? "border-[#0070f3] bg-[#fff8f0]"
              : "border-[#e5e5e5] hover:border-[#0a0a0a]",
          ].join(" ")}
        >
          <Upload size={24} className="text-[#d4d4d4]" aria-hidden="true" />
          <p className="text-sm text-[#737373] text-center">
            Drag and drop, paste from clipboard, or{" "}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="text-[#0a0a0a] underline underline-offset-2 focus-visible:outline-none"
            >
              choose a file
            </button>
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-hidden="true"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="flex items-center gap-1.5 mt-3 text-sm text-red-500">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={useSample}
          className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 rounded"
        >
          <ImageIcon size={14} aria-hidden="true" />
          Use sample image
        </button>
        <span className="text-[#e5e5e5]">·</span>
        <button
          type="button"
          onClick={async () => {
            try {
              const items = await navigator.clipboard.read();
              for (const item of items) {
                for (const type of item.types) {
                  if (type.startsWith("image/")) {
                    const blob = await item.getType(type);
                    const f = new File([blob], "pasted.png", { type });
                    const dt = new DataTransfer();
                    dt.items.add(f);
                    handleFiles(dt.files);
                    return;
                  }
                }
              }
              setError("No image found in clipboard.");
            } catch {
              setError("Could not read clipboard. Try paste shortcut instead.");
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 rounded"
        >
          <Clipboard size={14} aria-hidden="true" />
          Paste from clipboard
        </button>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!file}
          aria-disabled={!file}
        >
          Continue
          <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ── Step 2: Settings ───────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2",
        checked ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]",
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        ].join(" ")}
      />
    </button>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div
      className="inline-flex border border-[#e5e5e5] rounded-md overflow-hidden"
      role="radiogroup"
      aria-label={label}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            "h-8 px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-0 focus-visible:ring-inset",
            value === opt.value
              ? "bg-[#0a0a0a] text-white font-medium"
              : "bg-white text-[#737373] hover:text-[#0a0a0a]",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SettingsStep({
  settings,
  capabilities,
  onChange,
  onBack,
  onNext,
}: {
  settings: WizardSettings;
  capabilities: ProviderCapabilities | null;
  onChange: (s: WizardSettings) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const set = <K extends keyof WizardSettings>(k: K, v: WizardSettings[K]) =>
    onChange({ ...settings, [k]: v });

  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div>
      <h2 className="text-base font-semibold text-[#0a0a0a] mb-6">Generation settings</h2>

      <div className="space-y-6">
        {/* Model name */}
        <div>
          <label htmlFor="model-name" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
            Model name
          </label>
          <input
            id="model-name"
            type="text"
            placeholder="e.g. Arc chair study"
            value={settings.modelName}
            onChange={(e) => set("modelName", e.target.value)}
            className="w-full h-9 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
          />
        </div>

        {/* Quality */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-1.5">Quality</p>
          <SegmentedControl
            value={settings.quality}
            onChange={(v) => set("quality", v)}
            label="Quality"
            options={[
              { value: "fast", label: "Fast" },
              { value: "balanced", label: "Balanced" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
          <p className="text-xs text-[#737373] mt-1.5">
            {settings.quality === "fast" && "Fewer passes — useful for exploring ideas."}
            {settings.quality === "balanced" && "Standard depth of processing."}
            {settings.quality === "detailed" && "More reconstruction passes — may take longer."}
          </p>
        </div>

        {/* Style */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-1.5">Style</p>
          <SegmentedControl
            value={settings.style}
            onChange={(v) => set("style", v)}
            label="Style"
            options={[
              { value: "original", label: "Original" },
              { value: "clean", label: "Clean" },
              { value: "stylised", label: "Stylised" },
            ]}
          />
          <p className="text-xs text-[#737373] mt-1.5">
            {settings.style === "original" && "Preserves the reference as-is."}
            {settings.style === "clean" && "Smoothed and simplified topology."}
            {settings.style === "stylised" && "Exaggerated form for artistic use."}
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a]">Generate textures</p>
              <p className="text-xs text-[#737373]">Colour and material maps from the reference.</p>
            </div>
            <Toggle
              checked={settings.textures}
              onChange={(v) => capabilities?.textures !== false && set("textures", v)}
              label="Toggle generate textures"
            />
            {capabilities?.textures === false && (
              <p className="mt-1 text-xs text-amber-700">
                The configured provider does not support textures.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0a0a0a]">Symmetry</p>
              <p className="text-xs text-[#737373]">Mirror geometry across the vertical axis.</p>
            </div>
            <Toggle
              checked={settings.symmetry}
              onChange={(v) => set("symmetry", v)}
              label="Toggle symmetry"
            />
          </div>
        </div>

        {/* Background */}
        <div>
          <p className="text-sm font-medium text-[#0a0a0a] mb-1.5">Background mode</p>
          <SegmentedControl
            value={settings.background}
            onChange={(v) => set("background", v)}
            label="Background mode"
            options={[
              { value: "transparent", label: "Transparent" },
              { value: "white", label: "White" },
              { value: "black", label: "Black" },
            ]}
          />
        </div>

        {/* Intended use */}
        <div>
          <label htmlFor="intended-use" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
            Intended use
          </label>
          <select
            id="intended-use"
            value={settings.intendedUse}
            onChange={(e) => set("intendedUse", e.target.value as IntendedUse)}
            className="w-full h-9 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3] cursor-pointer"
          >
            <option value="design">Product / industrial design</option>
            <option value="game">Game asset</option>
            <option value="ar">AR / real-time</option>
            <option value="print">3D printing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Advanced */}
        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvancedOpen((o) => !o)}
            aria-expanded={advancedOpen}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#0a0a0a] hover:bg-[#f5f5f5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]"
          >
            Advanced
            <ChevronDown
              size={14}
              className={`text-[#737373] transition-transform ${advancedOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
          {advancedOpen && (
            <div className="px-4 pb-4 border-t border-[#e5e5e5] pt-4 space-y-4">
              <div>
                <label htmlFor="face-limit" className="block text-sm font-medium text-[#0a0a0a] mb-1.5">
                  Face limit
                </label>
                <input
                  id="face-limit"
                  type="number"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={settings.faceLimit}
                  onChange={(e) => set("faceLimit", e.target.value)}
                  disabled={capabilities?.polygonTargeting === false}
                  className="w-full h-9 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                />
                <p className="text-xs text-[#737373] mt-1">Maximum number of output faces.</p>
                {capabilities?.polygonTargeting === false && (
                  <p className="mt-1 text-xs text-amber-700">
                    The configured provider chooses polygon density automatically.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={14} aria-hidden="true" />
          Back
        </Button>
        <Button variant="primary" onClick={onNext}>
          Continue
          <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Review ─────────────────────────────────────────────────────────

const QUALITY_LABELS: Record<Quality, string> = { fast: "Fast", balanced: "Balanced", detailed: "Detailed" };
const STYLE_LABELS: Record<Style, string> = { original: "Original", clean: "Clean", stylised: "Stylised" };
const BG_LABELS: Record<BgMode, string> = { transparent: "Transparent", white: "White", black: "Black" };
const USE_LABELS: Record<IntendedUse, string> = {
  design: "Product / industrial design",
  game: "Game asset",
  ar: "AR / real-time",
  print: "3D printing",
  other: "Other",
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-[#f5f5f5] last:border-0">
      <span className="text-sm text-[#737373]">{label}</span>
      <span className="text-sm text-[#0a0a0a] font-medium">{value}</span>
    </div>
  );
}

function ReviewStep({
  file,
  settings,
  onBack,
  onGenerate,
  generating,
  error,
}: {
  file: UploadedFile;
  settings: WizardSettings;
  onBack: () => void;
  onGenerate: () => void;
  generating: boolean;
  error: string | null;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-[#0a0a0a] mb-6">Review before generating</h2>

      <div className="border border-[#e5e5e5] rounded-lg overflow-hidden mb-6">
        {/* Image */}
        <div className="flex items-center gap-4 p-4 border-b border-[#e5e5e5]">
          <div className="w-16 h-16 bg-[#f5f5f5] rounded flex-shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.dataUrl}
              alt="Reference image"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0a0a0a] truncate">
              {settings.modelName.trim() || "Untitled model"}
            </p>
            <p className="text-xs text-[#737373] truncate">
              {file.isSample ? "Sample image" : file.name}
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="px-4">
          <ReviewRow label="Model name" value={settings.modelName || "Untitled"} />
          <ReviewRow label="Quality" value={QUALITY_LABELS[settings.quality]} />
          <ReviewRow label="Style" value={STYLE_LABELS[settings.style]} />
          <ReviewRow label="Textures" value={settings.textures ? "Yes" : "No"} />
          <ReviewRow label="Background" value={BG_LABELS[settings.background]} />
          <ReviewRow label="Symmetry" value={settings.symmetry ? "Enabled" : "Off"} />
          <ReviewRow label="Intended use" value={USE_LABELS[settings.intendedUse]} />
          <ReviewRow label="Face limit" value={Number(settings.faceLimit).toLocaleString()} />
        </div>
      </div>

      <p className="text-xs text-[#737373] mb-6">
        Processing time depends on quality setting and server load. You can follow progress
        on the next screen.
      </p>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <ChevronLeft size={14} aria-hidden="true" />
          Back
        </Button>
        <Button variant="primary" onClick={onGenerate} disabled={generating}>
          {generating ? "Starting generation…" : "Generate model"}
          <ChevronRight size={14} aria-hidden="true" />
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-4 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

// ── Wizard root ────────────────────────────────────────────────────────────

export function NewProjectWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [settings, setSettings] = useState<WizardSettings>(DEFAULT_SETTINGS);
  const [capabilities, setCapabilities] = useState<ProviderCapabilities | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/generations/capabilities")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        const next = data.capabilities as ProviderCapabilities;
        setCapabilities(next);
        if (!next.textures) {
          setSettings((current) => ({ ...current, textures: false }));
        }
      })
      .catch(() => {
        // Defaults remain usable when capability discovery is temporarily unavailable.
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSetFile = useCallback(
    (f: UploadedFile | null) => {
      setFile(f);
      if (f && !settings.modelName) {
        const base = f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
        setSettings((s) => ({ ...s, modelName: base }));
      }
    },
    [settings.modelName]
  );

  const handleGenerate = async () => {
    if (!file || generating) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const uploadForm = new FormData();
      if (file.isSample) {
        uploadForm.set("sampleId", "arc-chair");
      } else if (file.rawFile) {
        uploadForm.set("file", file.rawFile);
      } else {
        throw new Error("The selected source image is no longer available.");
      }

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadForm,
      });
      const uploadPayload = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadPayload.error ?? "Could not upload the source image.");
      }

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId: "sample",
          projectName: settings.modelName.trim() || "Untitled model",
          // The generation API keys the source by `assetId`; the upload API
          // returns it as `id`, so map it across the boundary.
          source: { ...uploadPayload.asset, assetId: uploadPayload.asset.id },
          settings: {
            ...settings,
            modelName: undefined,
            faceLimit: Number(settings.faceLimit),
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not start generation.");
      }

      sessionStorage.setItem("meshlab_generation_source", file.dataUrl);
      router.push(`/projects/sample/generate?job=${payload.job.id}`);
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : "Could not start generation.",
      );
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <div className="mb-10">
        <StepIndicator current={step} />
      </div>

      {step === 0 && (
        <UploadStep
          file={file}
          onFile={handleSetFile}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <SettingsStep
          settings={settings}
          capabilities={capabilities}
          onChange={setSettings}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && file && (
        <ReviewStep
          file={file}
          settings={settings}
          onBack={() => setStep(1)}
          onGenerate={handleGenerate}
          generating={generating}
          error={generateError}
        />
      )}
    </div>
  );
}
