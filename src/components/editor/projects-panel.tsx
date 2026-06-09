"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Save, Trash2, Loader2, FolderOpen, Check } from "lucide-react";
import { useEditorStore, type EditorState } from "@/stores/editor-store";

interface StoredProject {
  id: string;
  name: string;
  updatedAt: string;
  state: Record<string, unknown>;
}

// Settings persisted per account (no image/mesh blobs — Clerk metadata is tiny).
const SAVE_KEYS: (keyof EditorState)[] = [
  "projectTitle",
  "transform",
  "material",
  "scene",
  "reliefHeight",
  "targetMm",
  "bedPresetId",
  "lithophane",
  "litho",
  "nodeVisible",
];

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function ProjectsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const applyProjectState = useEditorStore((s) => s.applyProjectState);
  const setProjectId = useEditorStore((s) => s.setProjectId);
  const projectId = useEditorStore((s) => s.projectId);
  const projectTitle = useEditorStore((s) => s.projectTitle);

  const [items, setItems] = useState<StoredProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/projects");
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Failed to load projects.");
      setItems(d.projects ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the user's saved projects when the dialog opens (data fetch, not a
    // render-derived value — the rule's synchronous-setState warning is moot here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) refresh();
  }, [open, refresh]);

  if (!open) return null;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const st = useEditorStore.getState();
      const state: Record<string, unknown> = {};
      for (const k of SAVE_KEYS) state[k] = st[k];
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: projectId ?? undefined, name: projectTitle || "Untitled", state }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Could not save.");
      setItems(d.projects ?? []);
      setProjectId(d.project.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const load = (p: StoredProject) => {
    applyProjectState(p.state as Partial<EditorState>);
    setProjectId(p.id);
    onClose();
  };

  const remove = async (id: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Could not delete.");
      setItems(d.projects ?? []);
      if (projectId === id) setProjectId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="My projects"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md mx-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] p-4">
          <h2 className="flex items-center gap-2 text-[14px] font-semibold text-[#e0e0e0]">
            <FolderOpen size={14} aria-hidden /> My projects
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded text-[#666] hover:bg-[#2a2a2a] hover:text-[#e0e0e0] transition-colors"
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={save}
            disabled={busy}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-[#0070f3] py-2 text-[12px] font-medium text-white hover:bg-[#0761d1] disabled:opacity-50 transition-colors"
          >
            {busy ? <Loader2 size={13} className="animate-spin" aria-hidden /> : <Save size={13} aria-hidden />}
            {projectId ? "Save changes" : "Save to my account"}
          </button>
          <p className="mt-2 text-[10px] leading-snug text-[#666]">
            Saves this project&rsquo;s settings to your account (synced across devices). The
            source image / mesh stays on this device.
          </p>

          <div className="mt-4 max-h-[46vh] overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-[12px] text-[#666]">Loading…</p>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-[12px] text-[#666]">No saved projects yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {items.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#181818] px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[12px] text-[#e0e0e0]">
                        {p.id === projectId && <Check size={11} className="text-[#0070f3]" aria-hidden />}
                        {p.name}
                      </p>
                      <p className="text-[10px] text-[#666]">{timeAgo(p.updatedAt)}</p>
                    </div>
                    <button
                      onClick={() => load(p)}
                      className="rounded border border-[#333] px-2 py-1 text-[10px] text-[#aaa] hover:border-[#444] hover:bg-[#252525] transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      aria-label={`Delete ${p.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded text-[#666] hover:bg-[#2a2a2a] hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="mt-3 text-[11px] text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
