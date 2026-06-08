export type ProjectStatus = "complete" | "generating" | "failed" | "draft";

export interface Project {
  id: string;
  name: string;
  tag: string;
  status: ProjectStatus;
  createdAt: string;
  vertices: string;
  faces: string;
  format: string;
  isSample?: boolean;
}

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: "sample",
    name: "Arc chair study",
    tag: "Furniture",
    status: "complete",
    createdAt: "2025-06-01",
    vertices: "2,841",
    faces: "5,680",
    format: "OBJ + GLB",
    isSample: true,
  },
];

// Inline SVG data URL used as the sample source image preview.
// Approximate chair silhouette — no external image required.
export const SAMPLE_SOURCE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23f5f5f5'/%3E%3C!-- seat --%3E%3Crect x='136' y='230' width='240' height='40' rx='6' fill='%23d4c9be'/%3E%3C!-- back left post --%3E%3Crect x='148' y='80' width='28' height='160' rx='14' fill='%23d4c9be'/%3E%3C!-- back right post --%3E%3Crect x='336' y='80' width='28' height='160' rx='14' fill='%23d4c9be'/%3E%3C!-- top rail --%3E%3Crect x='148' y='80' width='216' height='28' rx='14' fill='%23d4c9be'/%3E%3C!-- front left leg --%3E%3Crect x='148' y='270' width='28' height='140' rx='14' fill='%23d4c9be'/%3E%3C!-- front right leg --%3E%3Crect x='336' y='270' width='28' height='140' rx='14' fill='%23d4c9be'/%3E%3C/svg%3E";

export const GENERATION_STAGES = [
  "Preparing image",
  "Analysing shape",
  "Creating viewpoints",
  "Reconstructing geometry",
  "Cleaning mesh",
  "Generating textures",
  "Preparing editor",
  "Complete",
] as const;

export type GenerationStage = (typeof GENERATION_STAGES)[number];
