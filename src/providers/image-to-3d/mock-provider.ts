import { publicGenerationError } from "./errors";
import {
  GENERATION_STAGES,
  type CreateGenerationRequest,
  type GenerationStage,
  type ImageTo3DProvider,
  type ModelAsset,
  type ProviderCapabilities,
  type ProviderGeneration,
} from "./types";

interface MockRecord {
  createdAtMs: number;
  cancelled: boolean;
  behavior: "success" | "failure" | "timeout";
  settings: CreateGenerationRequest["settings"];
}

const globalMockRecords = globalThis as typeof globalThis & {
  __meshlabMockProviderRecords?: Map<string, MockRecord>;
};
const records =
  globalMockRecords.__meshlabMockProviderRecords ??
  (globalMockRecords.__meshlabMockProviderRecords = new Map());

const STAGE_DURATION_MS = process.env.NODE_ENV === "test" ? 10 : 1_100;
const FAILURE_STAGE_INDEX = 3;
const TIMEOUT_AFTER_MS = process.env.NODE_ENV === "test" ? 100 : 45_000;

function stageForElapsed(elapsedMs: number, textures: boolean): GenerationStage {
  const stages = textures
    ? GENERATION_STAGES
    : GENERATION_STAGES.filter((stage) => stage !== "generating_textures");
  const index = Math.min(Math.floor(elapsedMs / STAGE_DURATION_MS), stages.length - 1);
  return stages[index];
}

function sampleResult(settings: CreateGenerationRequest["settings"]): ModelAsset {
  const faces = Math.min(
    settings.faceLimit,
    settings.quality === "detailed" ? 18_400 : settings.quality === "fast" ? 4_800 : 9_600,
  );

  return {
    id: "sample-arc-chair-glb",
    format: "glb",
    url: "/models/arc-chair-sample.glb",
    bytes: settings.textures ? 2_860_000 : 940_000,
    vertices: Math.ceil(faces * 0.54),
    faces,
    meshCount: 1,
    textureCount: settings.textures ? 2 : 0,
  };
}

export class MockImageTo3DProvider implements ImageTo3DProvider {
  readonly id = "mock";
  readonly capabilities: ProviderCapabilities = {
    textures: true,
    backgroundRemoval: true,
    multiViewInput: false,
    watertightOutput: false,
    polygonTargeting: true,
    seedControl: false,
    cancellation: true,
    webhooks: false,
    progressEvents: false,
    outputFormats: ["glb"],
  };

  async createGeneration(input: CreateGenerationRequest): Promise<ProviderGeneration> {
    const providerJobId = crypto.randomUUID();
    records.set(providerJobId, {
      createdAtMs: Date.now(),
      cancelled: false,
      behavior: input.mockBehavior ?? "success",
      settings: input.settings,
    });

    return {
      providerJobId,
      status: "submitted",
      stage: "preparing_image",
    };
  }

  async getGenerationStatus(providerJobId: string): Promise<ProviderGeneration> {
    const record = records.get(providerJobId);
    if (!record) {
      return {
        providerJobId,
        status: "failed",
        stage: "preparing_image",
        error: publicGenerationError("unknown"),
      };
    }

    if (record.cancelled) {
      return {
        providerJobId,
        status: "cancelled",
        stage: stageForElapsed(Date.now() - record.createdAtMs, record.settings.textures),
        error: publicGenerationError("cancelled"),
      };
    }

    const elapsedMs = Date.now() - record.createdAtMs;
    const stage = stageForElapsed(elapsedMs, record.settings.textures);
    const stageIndex = GENERATION_STAGES.indexOf(stage);

    if (record.behavior === "failure" && stageIndex >= FAILURE_STAGE_INDEX) {
      return {
        providerJobId,
        status: "failed",
        stage,
        error: publicGenerationError("image_processing_failed"),
      };
    }

    if (record.behavior === "timeout" && elapsedMs >= TIMEOUT_AFTER_MS) {
      return {
        providerJobId,
        status: "timed_out",
        stage,
        error: publicGenerationError("generation_timed_out"),
      };
    }

    if (stage === "complete" && record.behavior === "success") {
      return {
        providerJobId,
        status: "succeeded",
        stage,
        result: sampleResult(record.settings),
      };
    }

    return {
      providerJobId,
      status: elapsedMs < STAGE_DURATION_MS ? "submitted" : "processing",
      stage,
    };
  }

  async getGenerationResult(providerJobId: string) {
    const status = await this.getGenerationStatus(providerJobId);
    if (status.status !== "succeeded" || !status.result) {
      throw new Error("Generation result is not available.");
    }
    return status.result;
  }

  async cancelGeneration(providerJobId: string) {
    const record = records.get(providerJobId);
    if (record) record.cancelled = true;
  }
}
