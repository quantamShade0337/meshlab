import { describe, expect, it } from "vitest";
import { createGenerationIdempotencyKey } from "./idempotency";
import type { CreateGenerationRequest } from "@/providers/image-to-3d/types";

const request: CreateGenerationRequest = {
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

describe("generation idempotency", () => {
  it("is stable for semantically identical requests", async () => {
    const first = await createGenerationIdempotencyKey("user:1", request);
    const second = await createGenerationIdempotencyKey("user:1", {
      ...request,
      settings: { ...request.settings },
    });
    expect(first).toBe(second);
  });

  it("changes for a deliberate regeneration", async () => {
    const first = await createGenerationIdempotencyKey("user:1", request);
    const second = await createGenerationIdempotencyKey("user:1", {
      ...request,
      regenerateNonce: "retry-2",
    });
    expect(first).not.toBe(second);
  });
});
