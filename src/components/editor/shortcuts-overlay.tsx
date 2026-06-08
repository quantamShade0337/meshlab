"use client";

import { X } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Tools",
    items: [
      ["V", "Select"],
      ["G", "Move"],
      ["R", "Rotate"],
      ["S", "Scale"],
    ],
  },
  {
    title: "Camera",
    items: [
      ["F", "Frame selection"],
      ["1", "Perspective"],
      ["2", "Front"],
      ["3", "Top"],
      ["4", "Right"],
    ],
  },
  {
    title: "Edit",
    items: [
      ["⌘/Ctrl Z", "Undo"],
      ["⌘/Ctrl ⇧ Z", "Redo"],
      ["Esc", "Deselect"],
      ["?", "This panel"],
    ],
  },
  {
    title: "Viewport",
    items: [
      ["Drag", "Orbit"],
      ["⇧ Drag", "Pan"],
      ["Scroll", "Zoom"],
      ["Click", "Select object"],
    ],
  },
];

export function ShortcutsOverlay() {
  const open = useEditorStore((s) => s.showShortcuts);
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={() => setShowShortcuts(false)} aria-hidden />
      <div className="relative w-full max-w-md mx-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] p-4">
          <h2 className="text-[14px] font-semibold text-[#e0e0e0]">Keyboard shortcuts</h2>
          <button
            onClick={() => setShowShortcuts(false)}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded text-[#666] hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors"
          >
            <X size={14} aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 p-5">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-2 text-[10px] uppercase tracking-widest text-[#666]">{g.title}</p>
              <ul className="space-y-1.5">
                {g.items.map(([key, label]) => (
                  <li key={label} className="flex items-center justify-between gap-3">
                    <span className="text-[12px] text-[#aaa]">{label}</span>
                    <kbd className="rounded border border-[#333] bg-[#252525] px-1.5 py-0.5 font-mono text-[10px] text-[#ccc]">
                      {key}
                    </kbd>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
