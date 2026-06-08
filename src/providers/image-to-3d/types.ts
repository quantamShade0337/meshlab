import { z } from "zod";

export const generationSettingsSchema = z.object({
  quality: z.enum(["fast", "balanced", "detailed"]),
  style: z.enum(["original", "clean", "stylised"]),
  textures: z.boolean(),
  background: z.enum(["transparent", "white", "black"]),
  symmetry: z.boolean(),
  intendedUse: z.enum(["design", "game", "ar", "print", "other"]),
  faceLimit: z.number().int().min(1_000).max(100_000),
});

export const generationSourceSchema = z.object({
  assetId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]),
  size: z.number().int().positive().max(20 * 1024 * 1024),
  width: z.number().int().min(512).max(16_384),
  height: z.number().int().min(512).max(16_384),
  fingerprint: z.string().min(16).max(128),
  isSample: z.boolean().default(false),
});

export const createGenerationSchema = z.object({
  projectId: z.string().trim().min(1).max(80),
  projectName: z.string().trim().min(1).max(120),
  source: generationSourceSchema,
  settings: generationSettingsSchema,
  regenerateNonce: z.string().max(80).optional(),
  mockBehavior: z.enum(["success", "failure", "timeout"]).optional(),
});

export type GenerationSettings = z.infer<typeof generationSettingsSchema>;
export type GenerationSource = z.infer<typeof generationSourceSchema>;
export type CreateGenerationRequest = z.infer<typeof createGenerationSchema>;

export const GENERATION_STAGES = [
  "preparing_image",
  "analysing_shape",
  "creating_viewpoints",
  "reconstructing_geometry",
  "cleaning_mesh",
  "generating_textures",
  "preparing_editor",
  "complete",
] as const;

export type GenerationStage = (typeof GENERATION_STAGES)[number];
export type GenerationJobStatus =
  | "queued"
  | "submitted"
  | "processing"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "timed_out";

export type GenerationErrorCode =
  | "provider_unavailable"
  | "provider_rejected_input"
  | "image_processing_failed"
  | "generation_timed_out"
  | "output_missing"
  | "output_corrupt"
  | "texture_generation_failed"
  | "asset_storage_failed"
  | "cancelled"
  | "unknown";

export interface ProviderCapabilities {
  textures: boolean;
  backgroundRemoval: boolean;
  multiViewInput: boolean;
  watertightOutput: boolean;
  polygonTargeting: boolean;
  seedControl: boolean;
  cancellation: boolean;
  webhooks: boolean;
  progressEvents: boolean;
  outputFormats: Array<"glb" | "obj" | "usdz" | "stl">;
}

export interface GenerationError {
  code: GenerationErrorCode;
  message: string;
  retryable: boolean;
  actions: Array<"retry" | "adjust_settings" | "replace_image" | "without_textures">;
}

export interface ModelAsset {
  id: string;
  format: "glb";
  url: string;
  bytes: number;
  vertices: number;
  faces: number;
  meshCount: number;
  textureCount: number;
}

export interface GenerationJob {
  id: string;
  provider: string;
  providerJobId: string;
  ownerId: string;
  projectId: string;
  projectName: string;
  status: GenerationJobStatus;
  stage: GenerationStage;
  createdAt: string;
  updatedAt: string;
  idempotencyKey: string;
  source: GenerationSource;
  settings: GenerationSettings;
  error?: GenerationError;
  result?: ModelAsset;
}

export interface ProviderGeneration {
  providerJobId: string;
  status: GenerationJobStatus;
  stage: GenerationStage;
  error?: GenerationError;
  result?: ModelAsset;
}

export interface ImageTo3DProvider {
  readonly id: string;
  readonly capabilities: ProviderCapabilities;
  createGeneration(input: CreateGenerationRequest): Promise<ProviderGeneration>;
  getGenerationStatus(providerJobId: string): Promise<ProviderGeneration>;
  getGenerationResult(providerJobId: string): Promise<ModelAsset>;
  cancelGeneration?(providerJobId: string): Promise<void>;
}

export const TERMINAL_GENERATION_STATUSES: GenerationJobStatus[] = [
  "succeeded",
  "failed",
  "cancelled",
  "timed_out",
];

export function isTerminalStatus(status: GenerationJobStatus) {
  return TERMINAL_GENERATION_STATUSES.includes(status);
}
