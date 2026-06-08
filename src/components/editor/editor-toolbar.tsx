"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Undo2,
  Redo2,
  Columns2,
  Maximize2,
  Download,
  MousePointer2,
  Move,
  RotateCcw,
  Scale,
  Focus,
  RefreshCw,
  Magnet,
  Keyboard,
  type LucideIcon,
} from "lucide-react";
import { useEditorStore, type ViewName } from "@/stores/editor-store";
import { ExportDialog } from "@/components/editor/export-dialog";

const VIEWS: { id: ViewName; label: string }[] = [
  { id: "persp", label: "Persp" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
  { id: "right", label: "Right" },
];

type Tool = "select" | "move" | "rotate" | "scale";

const TOOLS: { id: Tool; icon: LucideIcon; label: string; key: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select (V)", key: "V" },
  { id: "move", icon: Move, label: "Move (G)", key: "G" },
  { id: "rotate", icon: RotateCcw, label: "Rotate (R)", key: "R" },
  { id: "scale", icon: Scale, label: "Scale (S)", key: "S" },
];

function ToolBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={[
        "flex items-center justify-center w-8 h-8 rounded transition-colors",
        active
          ? "bg-[#0070f3] text-white"
          : "text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]",
      ].join(" ")}
    >
      <Icon size={14} aria-hidden />
    </button>
  );
}

export function EditorToolbar() {
  const projectTitle = useEditorStore((s) => s.projectTitle);
  const setProjectTitle = useEditorStore((s) => s.setProjectTitle);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const sourceComparison = useEditorStore((s) => s.sourceComparison);
  const setSourceComparison = useEditorStore((s) => s.setSourceComparison);
  const distractionFree = useEditorStore((s) => s.distractionFree);
  const setDistractionFree = useEditorStore((s) => s.setDistractionFree);
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const resetTransform = useEditorStore((s) => s.resetTransform);
  const requestView = useEditorStore((s) => s.requestView);
  const snap = useEditorStore((s) => s.scene.snap);
  const setScene = useEditorStore((s) => s.setScene);
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts);

  const [exportOpen, setExportOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center h-11 px-3 gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] shrink-0">
        <Link
          href="/projects/sample"
          className="flex items-center gap-1.5 text-[#888] hover:text-[#e0e0e0] transition-colors text-[12px]"
          aria-label="Back to project"
        >
          <ArrowLeft size={13} aria-hidden />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <input
          ref={titleRef}
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-[13px] font-medium text-[#e0e0e0] focus:outline-none focus:ring-1 focus:ring-[#0070f3] rounded px-1"
          aria-label="Project title"
          onKeyDown={(e) => e.stopPropagation()}
        />

        <div className="flex items-center gap-1 shrink-0">
          {saveStatus === "saving" ? (
            <span className="flex items-center gap-1 text-[10px] text-[#666]">
              <Loader2 size={10} className="animate-spin" aria-hidden />
              Saving
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#666]">
              <Check size={10} aria-hidden />
              Saved
            </span>
          )}
        </div>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
          className="flex items-center justify-center w-7 h-7 rounded text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] disabled:opacity-30 transition-colors"
        >
          <Undo2 size={13} aria-hidden />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className="flex items-center justify-center w-7 h-7 rounded text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] disabled:opacity-30 transition-colors"
        >
          <Redo2 size={13} aria-hidden />
        </button>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <button
          onClick={() => setSourceComparison(!sourceComparison)}
          title="Source comparison"
          aria-label="Toggle source comparison"
          aria-pressed={sourceComparison}
          className={[
            "flex items-center justify-center w-7 h-7 rounded transition-colors",
            sourceComparison
              ? "bg-[#0070f3]/20 text-[#0070f3]"
              : "text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]",
          ].join(" ")}
        >
          <Columns2 size={13} aria-hidden />
        </button>

        <button
          onClick={() => setDistractionFree(!distractionFree)}
          title="Distraction-free mode"
          aria-label="Toggle distraction-free mode"
          aria-pressed={distractionFree}
          className={[
            "flex items-center justify-center w-7 h-7 rounded transition-colors",
            distractionFree
              ? "bg-[#0070f3]/20 text-[#0070f3]"
              : "text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]",
          ].join(" ")}
        >
          <Maximize2 size={13} aria-hidden />
        </button>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <button
          onClick={() => setExportOpen(true)}
          className="flex items-center gap-1.5 h-7 px-3 rounded bg-[#0070f3] text-white text-[12px] font-medium hover:bg-[#0761d1] transition-colors"
          aria-label="Export model"
        >
          <Download size={12} aria-hidden />
          Export
        </button>
      </div>

      {/* Tool rail */}
      <div className="flex items-center h-9 px-3 gap-1 border-b border-[#2a2a2a] bg-[#181818] shrink-0">
        {TOOLS.map((t) => (
          <ToolBtn
            key={t.id}
            id={t.id}
            icon={t.icon}
            label={t.label}
            active={activeTool === t.id}
            onClick={() => setActiveTool(t.id)}
          />
        ))}

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        <button
          onClick={() => requestView("frame")}
          title="Frame selection (F)"
          aria-label="Frame selection"
          className="flex items-center justify-center w-8 h-8 rounded text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
        >
          <Focus size={14} aria-hidden />
        </button>

        <button
          onClick={resetTransform}
          title="Reset transform"
          aria-label="Reset transform"
          className="flex items-center justify-center w-8 h-8 rounded text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
        >
          <RefreshCw size={14} aria-hidden />
        </button>

        <button
          onClick={() => setScene({ snap: !snap })}
          title="Snap to grid"
          aria-label="Toggle snapping"
          aria-pressed={snap}
          className={[
            "flex items-center justify-center w-8 h-8 rounded transition-colors",
            snap
              ? "bg-[#0070f3]/20 text-[#0070f3]"
              : "text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a]",
          ].join(" ")}
        >
          <Magnet size={14} aria-hidden />
        </button>

        <div className="w-px h-5 bg-[#2a2a2a] mx-1" />

        {/* Camera view presets */}
        <div className="flex items-center gap-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => requestView(v.id)}
              title={`${v.label} view`}
              className="h-7 px-2 rounded text-[10px] font-medium text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts (?)"
          aria-label="Keyboard shortcuts"
          className="flex items-center justify-center w-7 h-7 rounded text-[#888] hover:text-[#e0e0e0] hover:bg-[#2a2a2a] transition-colors"
        >
          <Keyboard size={14} aria-hidden />
        </button>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </>
  );
}
