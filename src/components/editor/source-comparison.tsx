"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SAMPLE_SOURCE_IMAGE } from "@/lib/sample-data";
import { useEditorStore } from "@/stores/editor-store";

export function SourceComparison() {
  const sourceComparison = useEditorStore((s) => s.sourceComparison);
  const setSourceComparison = useEditorStore((s) => s.setSourceComparison);
  const [mode, setMode] = useState<"split" | "overlay">("split");
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);

  if (!sourceComparison) return null;

  return (
    <div
      className={[
        "absolute z-20 rounded border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl overflow-hidden",
        mode === "split"
          ? "bottom-10 right-2 w-52 h-52"
          : "inset-0 pointer-events-none",
      ].join(" ")}
    >
      {mode === "split" ? (
        <>
          <div className="flex items-center justify-between px-2 py-1 border-b border-[#2a2a2a] pointer-events-auto">
            <span className="text-[9px] uppercase tracking-widest text-[#555]">Source image</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMode("overlay")}
                className="text-[9px] text-[#666] hover:text-[#999] px-1"
              >
                Overlay
              </button>
              <button
                onClick={() => setSourceComparison(false)}
                aria-label="Close comparison"
                className="text-[#666] hover:text-[#999]"
              >
                <X size={10} />
              </button>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SAMPLE_SOURCE_IMAGE}
            alt="Source reference image"
            className="w-full h-full object-contain"
          />
        </>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SAMPLE_SOURCE_IMAGE}
            alt="Source reference image overlaid"
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity: overlayOpacity }}
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1a1a1a]/90 border border-[#2a2a2a] rounded px-2 py-1 pointer-events-auto">
            <label className="flex items-center gap-1.5">
              <span className="text-[9px] text-[#666]">Opacity</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-20 accent-[#0070f3]"
              />
            </label>
            <button
              onClick={() => setMode("split")}
              className="text-[9px] text-[#666] hover:text-[#999]"
            >
              Split
            </button>
            <button
              onClick={() => setSourceComparison(false)}
              aria-label="Close comparison"
              className="text-[#666] hover:text-[#999]"
            >
              <X size={10} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
