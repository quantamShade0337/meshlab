"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { RotateCcw, Download, Layers, Move3D } from "lucide-react";

const Canvas = dynamic(
  () => import("@react-three/fiber").then((m) => m.Canvas),
  { ssr: false }
);

const OrbitControls = dynamic(
  () => import("@react-three/drei").then((m) => m.OrbitControls),
  { ssr: false }
);

const ChairModel = dynamic(
  () =>
    import("@/components/three/chair-model").then((m) => m.ChairModel),
  { ssr: false }
);

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={1.4} castShadow />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Suspense fallback={null}>
        <ChairModel />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        target={[0, 0.4, 0]}
        makeDefault
      />
    </>
  );
}

const viewportTools = [
  { icon: Move3D, label: "Orbit" },
  { icon: Layers, label: "Layers" },
  { icon: RotateCcw, label: "Reset view" },
];

export function ProductDemo() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden border border-[#1f1f1f] shadow-float ring-1 ring-black/5"
      style={{ height: "520px" }}
      aria-label="Interactive 3D model editor preview"
    >
      <div className="flex h-full">
        {/* ── Source panel ── */}
        <div className="hidden md:flex flex-col w-52 shrink-0 border-r border-[#2a2a2a] bg-[#111111]">
          <div className="px-3 py-2.5 border-b border-[#2a2a2a]">
            <p className="text-[11px] font-medium text-[#555]  uppercase tracking-widest">
              Source
            </p>
          </div>

          {/* Reference image */}
          <div className="flex-1 p-3 flex flex-col gap-3">
            <div
              className="rounded overflow-hidden bg-[#1c1c1c] border border-[#2a2a2a] flex items-center justify-center"
              style={{ aspectRatio: "1" }}
            >
              {/* Placeholder arch chair silhouette drawn with SVG */}
              <svg
                viewBox="0 0 80 80"
                className="w-full h-full opacity-40"
                aria-hidden="true"
              >
                {/* left arch */}
                <path
                  d="M14 72 L14 34 Q14 18 24 18 Q34 18 34 34 L34 72"
                  stroke="#888"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* right arch */}
                <path
                  d="M46 72 L46 34 Q46 18 56 18 Q66 18 66 34 L66 72"
                  stroke="#888"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* seat */}
                <rect x="12" y="42" width="56" height="8" rx="3" fill="#888" opacity="0.7" />
              </svg>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[11px] text-[#555]">reference.jpg</p>
              <p className="text-[11px] text-[#3a3a3a]">1 image · ready</p>
            </div>

            <div className="mt-auto pt-3 border-t border-[#2a2a2a] flex flex-col gap-1.5">
              <p className="text-[11px] font-medium text-[#555] uppercase tracking-widest">
                Details
              </p>
              {[
                ["Vertices", "2,841"],
                ["Faces", "1,420"],
                ["Material", "1"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[11px] text-[#555]">{k}</span>
                  <span className="text-[11px] text-[#888] font-mono">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3D Viewport ── */}
        <div className="flex-1 flex flex-col bg-[#0d0d0d] min-w-0">
          {/* toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-1">
              {viewportTools.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="p-1.5 rounded text-[#555] hover:text-[#aaa] hover:bg-[#1c1c1c] transition-colors"
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>

            <span className="text-[11px] text-[#3a3a3a] hidden sm:block">
              Arc chair · v1
            </span>

            <button
              aria-label="Export model"
              className="flex items-center gap-1.5 h-7 px-3 rounded-full text-[11px] font-medium bg-white text-[#171717] hover:bg-[#e5e5e5] transition-colors"
            >
              <Download size={12} />
              Export
            </button>
          </div>

          {/* canvas */}
          <div className="flex-1 relative">
            <Canvas
              camera={{ position: [0, 1.4, 3.4], fov: 42 }}
              shadows="basic"
              gl={{ antialias: true }}
              style={{ background: "#0d0d0d" }}
            >
              <Scene />
            </Canvas>

            {/* corner hint */}
            <p className="absolute bottom-3 left-3 text-[10px] text-[#333] select-none pointer-events-none">
              Drag to rotate · scroll to zoom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
