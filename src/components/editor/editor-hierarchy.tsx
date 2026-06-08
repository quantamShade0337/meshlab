"use client";

import { Eye, EyeOff, Box } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

export function EditorHierarchy() {
  const selectedNode = useEditorStore((s) => s.selectedNode);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const nodeVisible = useEditorStore((s) => s.nodeVisible);
  const setNodeVisible = useEditorStore((s) => s.setNodeVisible);

  return (
    <aside
      className="w-44 flex-none border-r border-[#2a2a2a] bg-[#1a1a1a] flex flex-col"
      aria-label="Scene hierarchy"
    >
      <div className="px-3 py-2 border-b border-[#2a2a2a]">
        <span className="text-[10px] uppercase tracking-widest text-[#666] font-medium">
          Hierarchy
        </span>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        <div className="px-2">
          <span className="block text-[11px] text-[#555] px-2 py-1">Scene</span>
          <button
            onClick={() => setSelectedNode(selectedNode === "chair" ? null : "chair")}
            className={[
              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12px] transition-colors group",
              selectedNode === "chair"
                ? "bg-[#0070f3]/15 text-[#f0f0f0]"
                : "text-[#999] hover:text-[#f0f0f0] hover:bg-[#252525]",
            ].join(" ")}
            aria-pressed={selectedNode === "chair"}
          >
            <Box size={12} className="shrink-0" aria-hidden />
            <span className="flex-1 text-left truncate">Arc chair</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setNodeVisible(!nodeVisible);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setNodeVisible(!nodeVisible);
                }
              }}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded"
              aria-label={nodeVisible ? "Hide" : "Show"}
            >
              {nodeVisible ? (
                <Eye size={11} aria-hidden />
              ) : (
                <EyeOff size={11} aria-hidden />
              )}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
