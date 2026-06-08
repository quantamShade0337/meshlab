"use client";

import { useEffect } from "react";
import { useEditorStore, type ViewName } from "@/stores/editor-store";

const TOOL_KEYS: Record<string, "select" | "move" | "rotate" | "scale"> = {
  v: "select",
  g: "move",
  r: "rotate",
  s: "scale",
};

const VIEW_KEYS: Record<string, ViewName> = {
  "1": "persp",
  "2": "front",
  "3": "top",
  "4": "right",
};

function isTyping(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (e.target as HTMLElement)?.isContentEditable
  );
}

export function useEditorKeys() {
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const requestView = useEditorStore((s) => s.requestView);
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTyping(e)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (ctrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (ctrl) return; // leave other browser shortcuts alone

      if (e.key === "Escape") {
        setShowShortcuts(false);
        setSelectedNode(null);
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }
      if (e.key.toLowerCase() === "f") {
        requestView("frame");
        return;
      }

      const view = VIEW_KEYS[e.key];
      if (view) {
        requestView(view);
        return;
      }

      const tool = TOOL_KEYS[e.key.toLowerCase()];
      if (tool) setActiveTool(tool);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setActiveTool, undo, redo, setSelectedNode, requestView, setShowShortcuts]);
}
