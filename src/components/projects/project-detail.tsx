"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import {
  ExternalLink,
  RotateCcw,
  Download,
  Clock,
  Box,
  Layers,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChairModel } from "@/components/three/chair-model";
import { SAMPLE_SOURCE_IMAGE } from "@/lib/sample-data";

const VERSION_HISTORY = [
  { version: "v1", date: "2025-06-01", note: "Initial generation" },
];

function ModelPreview() {
  const [interactive, setInteractive] = useState(false);

  return (
    <div className="relative bg-[#f5f5f5] rounded-lg overflow-hidden aspect-square">
      {interactive ? (
        <>
          <Canvas
            camera={{ position: [0, 1.5, 3.5], fov: 38 }}
            shadows
            aria-label="Interactive 3D model viewer — drag to orbit"
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[4, 6, 4]} intensity={1} castShadow />
            <Suspense fallback={null}>
              <ChairModel autoRotate={false} />
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls
              enableZoom
              enablePan={false}
              minDistance={2}
              maxDistance={7}
            />
          </Canvas>
          <p className="absolute bottom-3 left-3 text-[10px] text-[#737373] bg-white/80 px-2 py-1 rounded select-none">
            Drag to orbit · scroll to zoom
          </p>
        </>
      ) : (
        <button
          onClick={() => setInteractive(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-3 hover:bg-[#efefef] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0070f3]"
          aria-label="Enable interactive 3D viewer"
        >
          <Box size={32} className="text-[#d4d4d4]" aria-hidden="true" />
          <span className="text-sm text-[#737373]">Click to load 3D viewer</span>
          <Maximize2 size={14} className="text-[#a3a3a3]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function ProjectDetail() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-[#737373] mb-8" aria-label="Breadcrumb">
        <Link href="/projects" className="hover:text-[#0a0a0a] transition-colors">
          Projects
        </Link>
        <span className="mx-2" aria-hidden="true">/</span>
        <span className="text-[#0a0a0a]">Arc chair study</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-[#0a0a0a]">Arc chair study</h1>
                <p className="text-sm text-[#737373] mt-0.5">
                  Furniture · Sample model
                </p>
              </div>
              <span className="flex-shrink-0 inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                Complete
              </span>
            </div>
          </div>

          {/* Model viewer */}
          <ModelPreview />

          {/* Metadata — clearly labeled as sample */}
          <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#e5e5e5] bg-[#fafafa]">
              <p className="text-xs font-medium uppercase tracking-wide text-[#737373]">
                Sample model metadata
              </p>
            </div>
            <div className="divide-y divide-[#f5f5f5]">
              {[
                { label: "Vertices", value: "2,841", icon: Layers },
                { label: "Faces", value: "5,680", icon: Box },
                { label: "Format", value: "OBJ + GLB", icon: Download },
                { label: "Created", value: "2025-06-01", icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#737373]">
                    <Icon size={13} aria-hidden="true" />
                    {label}
                  </div>
                  <span className="text-sm font-mono text-[#0a0a0a]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Source image */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#737373] mb-3">
              Source image
            </p>
            <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SAMPLE_SOURCE_IMAGE}
                alt="Arc chair reference photograph used to generate this model"
                className="w-full aspect-square object-contain bg-[#f5f5f5]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              as="a"
              href="/projects/sample/editor"
              variant="primary"
              className="justify-center"
            >
              <ExternalLink size={14} aria-hidden="true" />
              Open editor
            </Button>
            <Button
              as="a"
              href="/projects/sample/generate"
              variant="secondary"
              className="justify-center"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Generate another version
            </Button>
          </div>

          {/* Version history */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#737373] mb-3">
              Version history
            </p>
            <ul className="space-y-2">
              {VERSION_HISTORY.map((v) => (
                <li
                  key={v.version}
                  className="flex items-center justify-between border border-[#e5e5e5] rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0a0a0a]">{v.version}</p>
                    <p className="text-xs text-[#737373] mt-0.5">{v.note}</p>
                  </div>
                  <span className="text-xs text-[#737373]">{v.date}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent exports */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#737373] mb-3">
              Recent exports
            </p>
            <div className="border border-dashed border-[#e5e5e5] rounded-lg px-4 py-6 text-center">
              <p className="text-sm text-[#737373]">No exports yet</p>
              <p className="text-xs text-[#a3a3a3] mt-1">
                Open the editor to export OBJ, GLB, or USDZ.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
