import { afterEach, describe, expect, it, vi } from "vitest";
import { MockImageTo3DProvider } from "./mock-provider";
import type { CreateGenerationRequest } from "./types";

const input: CreateGenerationRequest = {
  projectId: "sample",
  projectName: "Chair",
  source: {
    assetId: "33ed9a0c-2747-4f99-b8f3-dc6904964eac",
    name: "chair.png",
    mimeType: "image/png",
    size: 2048,
    width: 1024,
    height: 1024,
    fingerprint: "a".repeat(64),
    isSample: false,
  },
  settings: {
    quality: "balanced",
    style: "original",
    textures: true,
    background: "transparent",
    symmetry: false,
    intendedUse: "design",
    faceLimit: 10_000,
  },
};

afterEach(() => {
  vi.useRealTimers();
});

describe("mock provider", () => {
  it("progresses deterministically and returns bounded model metadata", async () => {
    vi.useFakeTimers();
    const provider = new MockImageTo3DProvider();
    const created = await provider.createGeneration(input);
    expect(created.status).toBe("submitted");

    await vi.advanceTimersByTimeAsync(100);
    const completed = await provider.getGenerationStatus(created.providerJobId);
    expect(completed.status).toBe("succeeded");
    expect(completed.result?.faces).toBeLessThanOrEqual(input.settings.faceLimit);
    expect(completed.result?.textureCount).toBeGreaterThan(0);
  });

  it("supports deterministic provider failure", async () => {
    vi.useFakeTimers();
    const provider = new MockImageTo3DProvider();
    const created = await provider.createGeneration({
      ...input,
      mockBehavior: "failure",
    });
    await vi.advanceTimersByTimeAsync(40);
    const failed = await provider.getGenerationStatus(created.providerJobId);
    expect(failed.status).toBe("failed");
    expect(failed.error?.code).toBe("image_processing_failed");
  });

  it("supports cancellation", async () => {
    const provider = new MockImageTo3DProvider();
    const created = await provider.createGeneration(input);
    await provider.cancelGeneration(created.providerJobId);
    const cancelled = await provider.getGenerationStatus(created.providerJobId);
    expect(cancelled.status).toBe("cancelled");
    expect(cancelled.error?.code).toBe("cancelled");
  });
});
