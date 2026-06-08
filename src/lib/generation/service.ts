import "server-only";

import { createGenerationIdempotencyKey } from "./idempotency";
import {
  findJobByIdempotencyKey,
  getGenerationJob,
  saveGenerationJob,
  updateGenerationJob,
} from "./job-repository";
import { publicGenerationError } from "@/providers/image-to-3d/errors";
import { getImageTo3DProvider } from "@/providers/image-to-3d/provider-factory";
import {
  isTerminalStatus,
  type CreateGenerationRequest,
  type GenerationJob,
} from "@/providers/image-to-3d/types";
import { getOwnedSourceAsset } from "@/lib/uploads/source-assets";

export async function createGeneration(ownerId: string, input: CreateGenerationRequest) {
  const sourceAsset = getOwnedSourceAsset(ownerId, input.source.assetId);
  if (
    !sourceAsset ||
    sourceAsset.fingerprint !== input.source.fingerprint ||
    sourceAsset.mimeType !== input.source.mimeType ||
    sourceAsset.width !== input.source.width ||
    sourceAsset.height !== input.source.height
  ) {
    throw publicGenerationError("provider_rejected_input");
  }

  const idempotencyKey = await createGenerationIdempotencyKey(ownerId, input);
  const existing = findJobByIdempotencyKey(idempotencyKey);
  if (existing) return { job: existing, deduplicated: true };

  const provider = getImageTo3DProvider();
  const now = new Date().toISOString();

  try {
    const providerJob = await provider.createGeneration(input);
    const job: GenerationJob = {
      id: crypto.randomUUID(),
      provider: provider.id,
      providerJobId: providerJob.providerJobId,
      ownerId,
      projectId: input.projectId,
      projectName: input.projectName,
      status: providerJob.status,
      stage: providerJob.stage,
      createdAt: now,
      updatedAt: now,
      idempotencyKey,
      source: input.source,
      settings: input.settings,
    };
    saveGenerationJob(job);
    return { job, deduplicated: false };
  } catch {
    throw publicGenerationError("provider_unavailable");
  }
}

export async function refreshGeneration(ownerId: string, jobId: string) {
  const job = getOwnedJob(ownerId, jobId);
  if (isTerminalStatus(job.status)) return job;

  const provider = getImageTo3DProvider();
  try {
    const providerStatus = await provider.getGenerationStatus(job.providerJobId);
    return updateGenerationJob(job.id, {
      status: providerStatus.status,
      stage: providerStatus.stage,
      error: providerStatus.error,
      result: providerStatus.result,
    })!;
  } catch {
    return updateGenerationJob(job.id, {
      status: "failed",
      error: publicGenerationError("provider_unavailable"),
    })!;
  }
}

export async function cancelGeneration(ownerId: string, jobId: string) {
  const job = getOwnedJob(ownerId, jobId);
  if (isTerminalStatus(job.status)) return job;
  const provider = getImageTo3DProvider();
  await provider.cancelGeneration?.(job.providerJobId);
  return updateGenerationJob(job.id, {
    status: "cancelled",
    error: publicGenerationError("cancelled"),
  })!;
}

export async function retryGeneration(ownerId: string, jobId: string) {
  const job = getOwnedJob(ownerId, jobId);
  if (!isTerminalStatus(job.status)) return { job, deduplicated: true };

  return createGeneration(ownerId, {
    projectId: job.projectId,
    projectName: job.projectName,
    source: job.source,
    settings: job.settings,
    regenerateNonce: crypto.randomUUID(),
  });
}

export function getOwnedJob(ownerId: string, jobId: string) {
  const job = getGenerationJob(jobId);
  if (!job || job.ownerId !== ownerId) {
    const error = new Error("Generation not found.");
    error.name = "NotFoundError";
    throw error;
  }
  return job;
}
