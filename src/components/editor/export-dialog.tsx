"use client";

import { useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import * as THREE from "three";
import { useEditorStore } from "@/stores/editor-store";
import { exportTarget } from "@/lib/editor/export-target";

type Format = "STL" | "OBJ" | "GLB";

const FORMATS: { id: Format; label: string; note: string }[] = [
  { id: "STL", label: "STL — for 3D printing", note: "Drop straight into Cura, PrusaSlicer, Bambu Studio, or OrcaSlicer." },
  { id: "OBJ", label: "OBJ — mesh + geometry", note: "Wavefront mesh; widely supported by DCC tools." },
  { id: "GLB", label: "GLB — textured 3D", note: "Keeps materials/textures for the web and game engines." },
];

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [format, setFormat] = useState<Format>("STL");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addExport = useEditorStore((s) => s.addExport);
  const projectTitle = useEditorStore((s) => s.projectTitle);
  const targetMm = useEditorStore((s) => s.targetMm);
  const setTargetMm = useEditorStore((s) => s.setTargetMm);

  if (!open) return null;

  /** Clone the live model, scaled so its longest axis is `targetMm` mm. */
  function buildScaledClone() {
    const target = exportTarget.current;
    if (!target) return null;
    target.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(target);
    const size = box.getSize(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    const scale = targetMm / longest;

    const group = new THREE.Group();
    const clone = target.clone(true);
    group.add(clone);
    group.scale.setScalar(scale);
    group.updateMatrixWorld(true);
    return group;
  }

  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      const group = buildScaledClone();
      if (!group) throw new Error("No model to export. Load or generate one first.");

      const safe = projectTitle.replace(/\s+/g, "_") || "model";

      if (format === "STL") {
        const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter.js");
        const result = new STLExporter().parse(group, { binary: true });
        download(new Blob([result as BlobPart], { type: "model/stl" }), `${safe}.stl`);
      } else if (format === "OBJ") {
        const { OBJExporter } = await import("three/examples/jsm/exporters/OBJExporter.js");
        const text = new OBJExporter().parse(group);
        download(new Blob([text], { type: "model/obj" }), `${safe}.obj`);
      } else {
        const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
        const result = await new Promise<ArrayBuffer>((resolve, reject) => {
          new GLTFExporter().parse(
            group,
            (out) => resolve(out as ArrayBuffer),
            (err) => reject(err),
            { binary: true },
          );
        });
        download(new Blob([result], { type: "model/gltf-binary" }), `${safe}.glb`);
      }

      addExport(format);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  const note = FORMATS.find((f) => f.id === format)?.note ?? "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm mx-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h2 id="export-dialog-title" className="text-[14px] font-semibold text-[#e0e0e0]">
            Export model
          </h2>
          <button
            onClick={onClose}
            aria-label="Close export dialog"
            className="flex h-7 w-7 items-center justify-center rounded text-[#666] hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors"
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#555] mb-2">Format</div>
            <div className="space-y-1.5">
              {FORMATS.map(({ id, label }) => (
                <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="export-format"
                    value={id}
                    checked={format === id}
                    onChange={() => setFormat(id)}
                    className="accent-[#0070f3]"
                  />
                  <span className="text-[12px] text-[#ccc] group-hover:text-[#e0e0e0] transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
            {note && <p className="mt-2 text-[10px] text-[#666] pl-5">{note}</p>}
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-[#ccc]">Print size (longest side)</span>
            <span className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                max={1000}
                value={targetMm}
                onChange={(e) => setTargetMm(parseFloat(e.target.value))}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-20 bg-[#252525] border border-[#333] rounded px-2 py-1 text-[12px] text-[#e0e0e0] focus:outline-none focus:border-[#0070f3] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[11px] text-[#666]">mm</span>
            </span>
          </label>

          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#2a2a2a]">
          <button
            onClick={onClose}
            className="h-8 px-4 rounded text-[12px] text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={busy}
            className="flex items-center gap-1.5 h-8 px-4 rounded bg-[#0070f3] text-white text-[12px] font-medium hover:bg-[#0761d1] disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 size={12} className="animate-spin" aria-hidden /> : <Download size={12} aria-hidden />}
            {busy ? "Exporting…" : `Export ${format}`}
          </button>
        </div>
      </div>
    </div>
  );
}
