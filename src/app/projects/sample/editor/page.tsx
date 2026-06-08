"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { EditorHierarchy } from "@/components/editor/editor-hierarchy";
import { EditorInspector } from "@/components/editor/editor-inspector";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { SourceComparison } from "@/components/editor/source-comparison";
import { ShortcutsOverlay } from "@/components/editor/shortcuts-overlay";
import { useEditorKeys } from "@/components/editor/use-editor-keys";
import { useEffect, useState } from "react";
import { ExportDialog } from "@/components/editor/export-dialog";

/** Pull the reference image handed off by the generate flow into the store. */
function useSourceImageHandoff() {
  const setSourceImage = useEditorStore((s) => s.setSourceImage);
  useEffect(() => {
    try {
      const img = sessionStorage.getItem("meshlab_generation_source");
      if (img) setSourceImage(img);
    } catch {
      // sessionStorage may be unavailable; the sample chair is used instead.
    }
  }, [setSourceImage]);
}

const EditorViewport = dynamic(
  () =>
    import("@/components/editor/editor-viewport").then((m) => m.EditorViewport),
  { ssr: false }
);

function MobileView() {
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative bg-[#141414]">
        <EditorViewport />
      </div>
      <div className="px-4 py-4 bg-[#1a1a1a] border-t border-[#2a2a2a] space-y-3">
        <p className="text-[12px] text-[#888] leading-relaxed">
          The 3D editor is view-only on mobile. Open on a larger screen to edit
          transforms, materials, and scene settings.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/projects/sample"
            className="flex items-center gap-1.5 h-8 px-4 rounded border border-[#333] text-[12px] text-[#ccc] hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft size={12} aria-hidden />
            Back
          </Link>
          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 h-8 px-4 rounded bg-[#0070f3] text-white text-[12px] font-medium hover:bg-[#0761d1] transition-colors"
          >
            <Download size={12} aria-hidden />
            Export
          </button>
        </div>
      </div>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

const TOOL_LABEL: Record<string, string> = {
  select: "Select",
  move: "Move",
  rotate: "Rotate",
  scale: "Scale",
};

function DesktopEditor() {
  useEditorKeys();
  useSourceImageHandoff();
  const distractionFree = useEditorStore((s) => s.distractionFree);
  const activeTool = useEditorStore((s) => s.activeTool);
  const snap = useEditorStore((s) => s.scene.snap);
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts);

  return (
    <div className="flex flex-col h-full">
      {!distractionFree && <EditorToolbar />}

      <div className="flex flex-1 min-h-0">
        {!distractionFree && <EditorHierarchy />}

        {/* Central viewport */}
        <div className="flex-1 relative bg-[#141414]">
          <EditorViewport />
          <SourceComparison />
        </div>

        {!distractionFree && <EditorInspector />}
      </div>

      {/* Status bar */}
      {!distractionFree && (
        <div className="flex items-center h-6 px-3 gap-3 border-t border-[#2a2a2a] bg-[#181818] shrink-0">
          <span className="text-[10px] text-[#666]">
            Arc chair study · 2,841 verts · 5,680 faces
          </span>
          <span className="text-[10px] text-[#0070f3]">{TOOL_LABEL[activeTool]} tool</span>
          {snap && <span className="text-[10px] text-[#666]">· snap on</span>}
          <div className="flex-1" />
          <span className="text-[10px] text-[#444]">Orbit: drag · Pan: shift+drag · Zoom: scroll</span>
          <button
            onClick={() => setShowShortcuts(true)}
            className="text-[10px] text-[#666] hover:text-[#999] transition-colors"
          >
            Shortcuts (?)
          </button>
        </div>
      )}

      <ShortcutsOverlay />
    </div>
  );
}

export default function EditorPage() {
  return (
    <>
      {/* Mobile */}
      <div className="flex md:hidden flex-col h-full">
        <MobileView />
      </div>
      {/* Desktop */}
      <div className="hidden md:flex flex-col h-full">
        <DesktopEditor />
      </div>
    </>
  );
}
