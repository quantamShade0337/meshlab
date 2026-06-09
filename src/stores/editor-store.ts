"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number]; // degrees
  scale: [number, number, number];
}

export interface MaterialState {
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  flatShading: boolean;
}

export type EnvPreset =
  | "studio"
  | "city"
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest";

export interface SceneSettings {
  wireframe: boolean;
  grid: boolean;
  ground: boolean;
  shadows: boolean;
  envIntensity: number;
  envPreset: EnvPreset;
  background: string;
  autoRotate: boolean;
  snap: boolean;
  stats: boolean;
}

export type ViewName =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "persp"
  | "frame";

export interface EditorState {
  projectTitle: string;
  transform: Transform;
  material: MaterialState;
  scene: SceneSettings;
  selectedNode: string | null;
  nodeVisible: boolean;
  /** Uploaded reference image (data URL) to reconstruct on-device, if any. */
  sourceImage: string | null;
  /** Displacement scale for the depth relief reconstruction. */
  reliefHeight: number;
  /** Full-360° GLB (object URL / data URL) produced by the accurate path. */
  modelUrl: string | null;
  /** Target print size for the longest axis, in millimetres. */
  targetMm: number;
  /** Selected build-plate preset id. */
  bedPresetId: string;
  /** Lithophane mode: encode image brightness as printable thickness. */
  lithophane: boolean;
  litho: { minMm: number; maxMm: number; frame: boolean; invert: boolean };
  /** Id of the cloud (Clerk-stored) project currently open, if any. */
  projectId: string | null;
  activeTool: "select" | "move" | "rotate" | "scale";
  distractionFree: boolean;
  sourceComparison: boolean;
  showShortcuts: boolean;
  saveStatus: "saved" | "saving";
  recentExports: { id: string; format: string; timestamp: number }[];
  viewRequest: { view: ViewName; nonce: number } | null;
}

interface HistoryEntry {
  transform: Transform;
  material: MaterialState;
}

interface EditorActions {
  setProjectTitle: (title: string) => void;
  setTransform: (t: Partial<Transform>) => void;
  setMaterial: (m: Partial<MaterialState>) => void;
  setScene: (s: Partial<SceneSettings>) => void;
  setSelectedNode: (id: string | null) => void;
  setNodeVisible: (v: boolean) => void;
  setSourceImage: (v: string | null) => void;
  setReliefHeight: (v: number) => void;
  setModelUrl: (v: string | null) => void;
  setTargetMm: (v: number) => void;
  setBedPresetId: (v: string) => void;
  /** Id of the cloud project currently being edited (Clerk-stored). */
  setProjectId: (v: string | null) => void;
  /** Apply a saved project's settings onto the editor. */
  applyProjectState: (state: Partial<EditorState>) => void;
  setLithophane: (v: boolean) => void;
  setLitho: (p: Partial<EditorState["litho"]>) => void;
  setActiveTool: (tool: EditorState["activeTool"]) => void;
  setDistractionFree: (v: boolean) => void;
  setSourceComparison: (v: boolean) => void;
  setShowShortcuts: (v: boolean) => void;
  /** Snapshot current state into history — call once before an interactive drag. */
  pushHistory: () => void;
  /** Update transform without recording history (for live gizmo dragging). */
  setTransformLive: (t: Partial<Transform>) => void;
  requestView: (view: ViewName) => void;
  resetTransform: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  addExport: (format: string) => void;
}

const DEFAULT_TRANSFORM: Transform = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
};
const DEFAULT_MATERIAL: MaterialState = {
  color: "#d4c9be",
  roughness: 0.85,
  metalness: 0.0,
  opacity: 1,
  flatShading: false,
};
const DEFAULT_SCENE: SceneSettings = {
  wireframe: false,
  grid: true,
  ground: true,
  shadows: true,
  envIntensity: 1.0,
  envPreset: "studio",
  background: "#141414",
  autoRotate: false,
  snap: false,
  stats: true,
};

const MAX_HISTORY = 50;

interface FullStore extends EditorState, EditorActions {
  _past: HistoryEntry[];
  _future: HistoryEntry[];
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export const useEditorStore = create<FullStore>()(
  persist(
    (set, get) => ({
      projectTitle: "Arc chair study",
      transform: { ...DEFAULT_TRANSFORM },
      material: { ...DEFAULT_MATERIAL },
      scene: { ...DEFAULT_SCENE },
      selectedNode: "chair",
      nodeVisible: true,
      sourceImage: null,
      reliefHeight: 0.45,
      modelUrl: null,
      targetMm: 100,
      bedPresetId: "ender3",
      lithophane: false,
      litho: { minMm: 0.8, maxMm: 3, frame: true, invert: false },
      projectId: null,
      activeTool: "select",
      distractionFree: false,
      sourceComparison: false,
      showShortcuts: false,
      saveStatus: "saved",
      recentExports: [],
      viewRequest: null,
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,

      setProjectTitle: (title) => set({ projectTitle: title }),

      setTransform: (t) => {
        const prev = get();
        const entry: HistoryEntry = {
          transform: prev.transform,
          material: prev.material,
        };
        const past = [...prev._past, entry].slice(-MAX_HISTORY);
        const next = { ...prev.transform, ...t };
        set({ transform: next, _past: past, _future: [], canUndo: true, canRedo: false });
        scheduleSave(set);
      },

      setMaterial: (m) => {
        const prev = get();
        const entry: HistoryEntry = {
          transform: prev.transform,
          material: prev.material,
        };
        const past = [...prev._past, entry].slice(-MAX_HISTORY);
        const next = { ...prev.material, ...m };
        set({ material: next, _past: past, _future: [], canUndo: true, canRedo: false });
        scheduleSave(set);
      },

      setScene: (s) => {
        set((st) => ({ scene: { ...st.scene, ...s } }));
        scheduleSave(set);
      },

      setSelectedNode: (id) => set({ selectedNode: id }),
      setNodeVisible: (v) => set({ nodeVisible: v }),
      setSourceImage: (v) => set({ sourceImage: v, selectedNode: v ? "chair" : null }),
      setReliefHeight: (v) => set({ reliefHeight: v }),
      setModelUrl: (v) => set({ modelUrl: v, selectedNode: v ? "chair" : null }),
      setTargetMm: (v) => set({ targetMm: Math.max(1, Math.min(1000, v || 0)) }),
      setBedPresetId: (v) => set({ bedPresetId: v }),
      setLithophane: (v) => set({ lithophane: v, selectedNode: "chair" }),
      setLitho: (p) => set((st) => ({ litho: { ...st.litho, ...p } })),
      setProjectId: (v) => set({ projectId: v }),
      applyProjectState: (state) => set(state),
      setActiveTool: (tool) => set({ activeTool: tool }),
      setDistractionFree: (v) => set({ distractionFree: v }),
      setSourceComparison: (v) => set({ sourceComparison: v }),
      setShowShortcuts: (v) => set({ showShortcuts: v }),

      pushHistory: () => {
        const prev = get();
        const entry: HistoryEntry = {
          transform: prev.transform,
          material: prev.material,
        };
        const past = [...prev._past, entry].slice(-MAX_HISTORY);
        set({ _past: past, _future: [], canUndo: true, canRedo: false });
      },

      setTransformLive: (t) => {
        set((st) => ({ transform: { ...st.transform, ...t } }));
        scheduleSave(set);
      },

      requestView: (view) =>
        set((st) => ({
          viewRequest: { view, nonce: (st.viewRequest?.nonce ?? 0) + 1 },
        })),

      resetTransform: () => {
        const prev = get();
        const entry: HistoryEntry = { transform: prev.transform, material: prev.material };
        const past = [...prev._past, entry].slice(-MAX_HISTORY);
        set({ transform: { ...DEFAULT_TRANSFORM }, _past: past, _future: [], canUndo: true, canRedo: false });
        scheduleSave(set);
      },

      undo: () => {
        const { _past, _future, transform, material } = get();
        if (!_past.length) return;
        const entry = _past[_past.length - 1];
        const newPast = _past.slice(0, -1);
        const newFuture = [{ transform, material }, ..._future].slice(0, MAX_HISTORY);
        set({
          transform: entry.transform,
          material: entry.material,
          _past: newPast,
          _future: newFuture,
          canUndo: newPast.length > 0,
          canRedo: true,
        });
        scheduleSave(set);
      },

      redo: () => {
        const { _past, _future, transform, material } = get();
        if (!_future.length) return;
        const entry = _future[0];
        const newFuture = _future.slice(1);
        const newPast = [..._past, { transform, material }].slice(-MAX_HISTORY);
        set({
          transform: entry.transform,
          material: entry.material,
          _past: newPast,
          _future: newFuture,
          canUndo: true,
          canRedo: newFuture.length > 0,
        });
        scheduleSave(set);
      },

      addExport: (format) => {
        const record = { id: crypto.randomUUID(), format, timestamp: Date.now() };
        set((st) => ({ recentExports: [record, ...st.recentExports].slice(0, 20) }));
      },
    }),
    {
      name: "meshlab-editor-v2",
      partialize: (s) => ({
        projectTitle: s.projectTitle,
        transform: s.transform,
        material: s.material,
        scene: s.scene,
        nodeVisible: s.nodeVisible,
        reliefHeight: s.reliefHeight,
        targetMm: s.targetMm,
        bedPresetId: s.bedPresetId,
        lithophane: s.lithophane,
        litho: s.litho,
        projectId: s.projectId,
        recentExports: s.recentExports,
        // sourceImage is intentionally NOT persisted (data URLs can be large).
      }),
      // Deep-merge persisted state onto current defaults so newly added
      // material/scene/transform fields are always present after an upgrade.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<FullStore>;
        return {
          ...current,
          ...p,
          transform: { ...current.transform, ...(p.transform ?? {}) },
          material: { ...current.material, ...(p.material ?? {}) },
          scene: { ...current.scene, ...(p.scene ?? {}) },
        };
      },
    }
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scheduleSave(set: (partial: any) => void) {
  set({ saveStatus: "saving" });
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => set({ saveStatus: "saved" }), 800);
}
