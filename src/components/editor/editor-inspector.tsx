"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { useEditorStore, type EnvPreset } from "@/stores/editor-store";
import { exportTarget } from "@/lib/editor/export-target";
import {
  measurePrint,
  fitsBed,
  formatMinutes,
  BED_PRESETS,
  type PrintStats,
} from "@/lib/editor/print";

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase tracking-widest text-[#555]">{label}</span>
      <input
        type="number"
        value={Number(value.toFixed(3))}
        step={0.01}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onKeyDown={(e) => e.stopPropagation()}
        className="w-full bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  fmt,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  fmt?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-[11px] text-[#999]">{label}</span>
        <span className="text-[9px] text-[#666] font-mono">
          {fmt ? fmt(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#0070f3]"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-[11px] text-[#999]">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[#0070f3]"
      />
    </label>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#2a2a2a]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-1.5 px-3 py-2 text-[10px] uppercase tracking-widest text-[#666] hover:text-[#999] transition-colors"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
        {title}
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}

const MATERIAL_PRESETS = [
  { name: "Clay", color: "#d4c9be", roughness: 0.9, metalness: 0.0 },
  { name: "Plastic", color: "#e6e6e6", roughness: 0.4, metalness: 0.0 },
  { name: "Metal", color: "#b8bcc4", roughness: 0.25, metalness: 1.0 },
  { name: "Matte", color: "#8a8f98", roughness: 1.0, metalness: 0.0 },
  { name: "Gold", color: "#d4af37", roughness: 0.3, metalness: 1.0 },
  { name: "Carbon", color: "#2b2b30", roughness: 0.6, metalness: 0.2 },
];

const ENV_PRESETS: EnvPreset[] = [
  "studio",
  "city",
  "sunset",
  "dawn",
  "night",
  "warehouse",
  "forest",
];

export function EditorInspector() {
  const transform = useEditorStore((s) => s.transform);
  const setTransform = useEditorStore((s) => s.setTransform);
  const material = useEditorStore((s) => s.material);
  const setMaterial = useEditorStore((s) => s.setMaterial);
  const scene = useEditorStore((s) => s.scene);
  const setScene = useEditorStore((s) => s.setScene);
  const selectedNode = useEditorStore((s) => s.selectedNode);
  const sourceImage = useEditorStore((s) => s.sourceImage);
  const setSourceImage = useEditorStore((s) => s.setSourceImage);
  const reliefHeight = useEditorStore((s) => s.reliefHeight);
  const setReliefHeight = useEditorStore((s) => s.setReliefHeight);
  const modelUrl = useEditorStore((s) => s.modelUrl);
  const setModelUrl = useEditorStore((s) => s.setModelUrl);
  const targetMm = useEditorStore((s) => s.targetMm);
  const setTargetMm = useEditorStore((s) => s.setTargetMm);
  const bedPresetId = useEditorStore((s) => s.bedPresetId);
  const setBedPresetId = useEditorStore((s) => s.setBedPresetId);
  const lithophane = useEditorStore((s) => s.lithophane);
  const setLithophane = useEditorStore((s) => s.setLithophane);
  const litho = useEditorStore((s) => s.litho);
  const setLitho = useEditorStore((s) => s.setLitho);
  const [linkedScale, setLinkedScale] = useState(true);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [calcNonce, setCalcNonce] = useState(0);

  const bed = BED_PRESETS.find((b) => b.id === bedPresetId) ?? BED_PRESETS[0];

  // Derived from the live model — recomputed when inputs change or on Recalculate.
  const printStats: PrintStats | null = useMemo(() => {
    const target = exportTarget.current;
    if (!target) return null;
    try {
      return measurePrint(target, targetMm);
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMm, modelUrl, sourceImage, reliefHeight, calcNonce]);

  const fits = printStats ? fitsBed(printStats.dims, bed) : null;

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setModelUrl(null);
    const reader = new FileReader();
    reader.onload = () => setSourceImage(reader.result as string);
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const runAccurate = async () => {
    if (!sourceImage || cloudBusy) return;
    setCloudBusy(true);
    setCloudError(null);
    try {
      const res = await fetch("/api/reconstruct", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: sourceImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Reconstruction failed.");
      setModelUrl(data.glb as string);
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : "Reconstruction failed.");
    } finally {
      setCloudBusy(false);
    }
  };

  const updateScale = (axis: 0 | 1 | 2, val: number) => {
    if (linkedScale) {
      setTransform({ scale: [val, val, val] });
    } else {
      const next = [...transform.scale] as [number, number, number];
      next[axis] = val;
      setTransform({ scale: next });
    }
  };

  return (
    <aside
      className="w-56 flex-none border-l border-[#2a2a2a] bg-[#1a1a1a] flex flex-col overflow-y-auto"
      aria-label="Inspector"
    >
      <div className="px-3 py-2 border-b border-[#2a2a2a] shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-[#666] font-medium">
          Inspector
        </span>
      </div>

      <Section title="Reconstruction">
        {sourceImage ? (
          <>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sourceImage}
                alt="Source reference"
                className="h-10 w-10 rounded border border-[#333] object-cover"
              />
              <p className="flex-1 text-[10px] leading-snug text-[#888]">
                {modelUrl
                  ? "Full 360° model loaded — editable like any mesh."
                  : "Fast depth relief, reconstructed on-device."}
              </p>
            </div>

            {modelUrl ? (
              <button
                onClick={() => setModelUrl(null)}
                className="w-full rounded border border-[#333] py-1.5 text-[10px] text-[#aaa] hover:border-[#444] hover:bg-[#252525] transition-colors"
              >
                ← Back to fast preview
              </button>
            ) : (
              <>
                <Slider
                  label="Relief depth"
                  value={reliefHeight}
                  min={0.05}
                  max={1.2}
                  step={0.05}
                  onChange={setReliefHeight}
                />
                <button
                  onClick={runAccurate}
                  disabled={cloudBusy}
                  className="w-full rounded bg-[#0070f3] py-1.5 text-[11px] font-medium text-white hover:bg-[#0761d1] disabled:opacity-50 transition-colors"
                >
                  {cloudBusy ? "Generating 360°… (up to a minute)" : "Generate accurate 360°"}
                </button>
                <p className="text-[9px] leading-snug text-[#666]">
                  Accurate mode runs a full 360° reconstruction in the cloud.
                </p>
                {cloudError && (
                  <p className="text-[10px] leading-snug text-red-400">{cloudError}</p>
                )}
              </>
            )}

            <div className="flex gap-1.5 pt-1">
              <label className="flex-1 cursor-pointer rounded border border-[#333] py-1.5 text-center text-[10px] text-[#aaa] hover:border-[#444] hover:bg-[#252525] transition-colors">
                Replace image
                <input type="file" accept="image/*" className="sr-only" onChange={pickImage} />
              </label>
              <button
                onClick={() => {
                  setModelUrl(null);
                  setSourceImage(null);
                }}
                className="flex-1 rounded border border-[#333] py-1.5 text-[10px] text-[#aaa] hover:border-[#444] hover:bg-[#252525] transition-colors"
              >
                Sample chair
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] leading-snug text-[#777]">
              Load an image to reconstruct a real depth relief on-device — no
              upload, no cost.
            </p>
            <label className="block cursor-pointer rounded-md border border-dashed border-[#333] py-3 text-center text-[11px] text-[#aaa] hover:border-[#0070f3] hover:text-[#e0e0e0] transition-colors">
              Load image
              <input type="file" accept="image/*" className="sr-only" onChange={pickImage} />
            </label>
          </>
        )}
      </Section>

      <Section title="Lithophane">
        {sourceImage ? (
          <>
            <Toggle label="Lithophane mode" checked={lithophane} onChange={setLithophane} />
            {lithophane && (
              <>
                <Slider
                  label="Min thickness"
                  value={litho.minMm}
                  min={0.4}
                  max={3}
                  step={0.1}
                  fmt={(v) => `${v.toFixed(1)} mm`}
                  onChange={(v) => setLitho({ minMm: v })}
                />
                <Slider
                  label="Max thickness"
                  value={litho.maxMm}
                  min={1}
                  max={6}
                  step={0.1}
                  fmt={(v) => `${v.toFixed(1)} mm`}
                  onChange={(v) => setLitho({ maxMm: v })}
                />
                <Toggle label="Border frame" checked={litho.frame} onChange={(v) => setLitho({ frame: v })} />
                <Toggle label="Invert" checked={litho.invert} onChange={(v) => setLitho({ invert: v })} />
                <p className="text-[9px] leading-snug text-[#666]">
                  Width follows the print size in “3D printing”. Print in white/translucent
                  filament and backlight it.
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-[10px] text-[#666]">Load an image above to make a lithophane.</p>
        )}
      </Section>

      <Section title="3D printing">
        <label className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#999]">Size (longest side)</span>
          <span className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={1000}
              value={targetMm}
              onChange={(e) => setTargetMm(parseFloat(e.target.value))}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-16 bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-[10px] text-[#666]">mm</span>
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">Build plate</span>
          <select
            value={bedPresetId}
            onChange={(e) => setBedPresetId(e.target.value)}
            className="w-full bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3]"
          >
            {BED_PRESETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.x}×{b.y}×{b.z}
              </option>
            ))}
          </select>
        </label>

        {printStats ? (
          <>
            <div
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] ${
                fits ? "bg-[#0e2a16] text-[#4ade80]" : "bg-[#2a0e0e] text-[#f87171]"
              }`}
            >
              {fits ? <Check size={11} aria-hidden /> : <AlertTriangle size={11} aria-hidden />}
              {fits ? `Fits ${bed.name}` : `Too big for ${bed.name}`}
            </div>

            <div className="space-y-1 pt-1 font-mono text-[10px] text-[#888]">
              <div className="flex justify-between">
                <span>Size</span>
                <span className="text-[#bbb]">
                  {Math.round(printStats.dims[0])} × {Math.round(printStats.dims[1])} ×{" "}
                  {Math.round(printStats.dims[2])} mm
                </span>
              </div>
              <div className="flex justify-between">
                <span>Triangles</span>
                <span className="text-[#bbb]">{printStats.triangles.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Filament</span>
                <span className="text-[#bbb]">{printStats.filamentM.toFixed(1)} m</span>
              </div>
              <div className="flex justify-between">
                <span>Weight</span>
                <span className="text-[#bbb]">~{printStats.massTypicalG.toFixed(0)} g</span>
              </div>
              <div className="flex justify-between">
                <span>Est. time</span>
                <span className="text-[#bbb]">~{formatMinutes(printStats.minutes)}</span>
              </div>
            </div>

            <button
              onClick={() => setCalcNonce((n) => n + 1)}
              className="flex w-full items-center justify-center gap-1.5 rounded border border-[#333] py-1.5 text-[10px] text-[#aaa] hover:border-[#444] hover:bg-[#252525] transition-colors"
            >
              <RefreshCw size={11} aria-hidden /> Recalculate
            </button>
            <p className="text-[9px] leading-snug text-[#666]">
              Weight/time assume ~20% infill in PLA — estimates only.
            </p>
          </>
        ) : (
          <p className="text-[10px] text-[#666]">
            Load or generate a model to see print stats.
          </p>
        )}
      </Section>

      {selectedNode ? (
        <>
          <Section title="Transform">
            <div className="text-[10px] text-[#555] uppercase tracking-widest mt-1">Position</div>
            <div className="grid grid-cols-3 gap-1">
              {(["X", "Y", "Z"] as const).map((ax, i) => (
                <NumField
                  key={ax}
                  label={ax}
                  value={transform.position[i]}
                  onChange={(v) => {
                    const next = [...transform.position] as [number, number, number];
                    next[i] = v;
                    setTransform({ position: next });
                  }}
                />
              ))}
            </div>
            <div className="text-[10px] text-[#555] uppercase tracking-widest mt-1">Rotation °</div>
            <div className="grid grid-cols-3 gap-1">
              {(["X", "Y", "Z"] as const).map((ax, i) => (
                <NumField
                  key={ax}
                  label={ax}
                  value={transform.rotation[i]}
                  onChange={(v) => {
                    const next = [...transform.rotation] as [number, number, number];
                    next[i] = v;
                    setTransform({ rotation: next });
                  }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-[10px] text-[#555] uppercase tracking-widest">Scale</div>
              <button
                onClick={() => setLinkedScale(!linkedScale)}
                className={[
                  "text-[9px] px-1.5 py-0.5 rounded border transition-colors",
                  linkedScale
                    ? "border-[#0070f3]/50 text-[#0070f3]"
                    : "border-[#333] text-[#555] hover:border-[#444]",
                ].join(" ")}
                aria-pressed={linkedScale}
              >
                {linkedScale ? "Linked" : "Free"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(["X", "Y", "Z"] as const).map((ax, i) => (
                <NumField
                  key={ax}
                  label={ax}
                  value={transform.scale[i]}
                  onChange={(v) => updateScale(i as 0 | 1 | 2, v)}
                />
              ))}
            </div>
          </Section>

          <Section title="Material">
            <div className="text-[9px] uppercase tracking-widest text-[#555]">Presets</div>
            <div className="grid grid-cols-3 gap-1">
              {MATERIAL_PRESETS.map((p) => {
                const active =
                  material.color.toLowerCase() === p.color.toLowerCase() &&
                  material.roughness === p.roughness &&
                  material.metalness === p.metalness;
                return (
                  <button
                    key={p.name}
                    onClick={() =>
                      setMaterial({
                        color: p.color,
                        roughness: p.roughness,
                        metalness: p.metalness,
                      })
                    }
                    className={[
                      "flex flex-col items-center gap-1 rounded border py-1.5 transition-colors",
                      active
                        ? "border-[#0070f3] bg-[#0070f3]/10"
                        : "border-[#333] hover:border-[#444] hover:bg-[#252525]",
                    ].join(" ")}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/30"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-[9px] text-[#999]">{p.name}</span>
                  </button>
                );
              })}
            </div>

            <label className="flex flex-col gap-0.5 pt-1">
              <span className="text-[9px] uppercase tracking-widest text-[#555]">Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={material.color}
                  onChange={(e) => setMaterial({ color: e.target.value })}
                  className="w-8 h-7 rounded cursor-pointer border border-[#333] bg-transparent"
                />
                <input
                  type="text"
                  value={material.color}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                      setMaterial({ color: e.target.value });
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="flex-1 bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3]"
                />
              </div>
            </label>
            <Slider
              label="Roughness"
              value={material.roughness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setMaterial({ roughness: v })}
            />
            <Slider
              label="Metalness"
              value={material.metalness}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setMaterial({ metalness: v })}
            />
            <Slider
              label="Opacity"
              value={material.opacity}
              min={0.1}
              max={1}
              step={0.01}
              onChange={(v) => setMaterial({ opacity: v })}
            />
            <Toggle
              label="Flat shading"
              checked={material.flatShading}
              onChange={(v) => setMaterial({ flatShading: v })}
            />
            <Toggle
              label="Wireframe"
              checked={scene.wireframe}
              onChange={(v) => setScene({ wireframe: v })}
            />
          </Section>
        </>
      ) : (
        <div className="px-3 py-8 text-center">
          <p className="text-[11px] text-[#555]">Select an object to inspect</p>
          <p className="mt-1 text-[10px] text-[#444]">
            Click the model or the Hierarchy item.
          </p>
        </div>
      )}

      <Section title="Environment">
        <label className="flex flex-col gap-1">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">Preset</span>
          <select
            value={scene.envPreset}
            onChange={(e) => setScene({ envPreset: e.target.value as EnvPreset })}
            className="w-full bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3] capitalize"
          >
            {ENV_PRESETS.map((p) => (
              <option key={p} value={p} className="capitalize">
                {p}
              </option>
            ))}
          </select>
        </label>
        <Slider
          label="Env intensity"
          value={scene.envIntensity}
          min={0}
          max={3}
          step={0.1}
          fmt={(v) => v.toFixed(1)}
          onChange={(v) => setScene({ envIntensity: v })}
        />
        <label className="flex flex-col gap-0.5 pt-1">
          <span className="text-[9px] uppercase tracking-widest text-[#555]">Background</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={scene.background}
              onChange={(e) => setScene({ background: e.target.value })}
              className="w-8 h-7 rounded cursor-pointer border border-[#333] bg-transparent"
            />
            <input
              type="text"
              value={scene.background}
              onChange={(e) => {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                  setScene({ background: e.target.value });
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex-1 bg-[#252525] border border-[#333] rounded px-1.5 py-1 text-[11px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3]"
            />
          </div>
        </label>
      </Section>

      <Section title="Scene">
        <Toggle label="Grid" checked={scene.grid} onChange={(v) => setScene({ grid: v })} />
        <Toggle label="Ground shadow" checked={scene.ground} onChange={(v) => setScene({ ground: v })} />
        <Toggle label="Shadows" checked={scene.shadows} onChange={(v) => setScene({ shadows: v })} />
        <Toggle label="Auto-rotate" checked={scene.autoRotate} onChange={(v) => setScene({ autoRotate: v })} />
        <Toggle label="Snap to grid" checked={scene.snap} onChange={(v) => setScene({ snap: v })} />
        <Toggle label="Show stats" checked={scene.stats} onChange={(v) => setScene({ stats: v })} />
      </Section>
    </aside>
  );
}
