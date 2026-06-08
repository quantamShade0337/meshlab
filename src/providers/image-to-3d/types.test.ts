import { describe, expect, it } from "vitest";
import { createGenerationSchema, generationSettingsSchema } from "./types";

const validSettings = {
  quality: "balanced",
  style: "original",
  textures: true,
  background: "transparent",
  symmetry: false,
  intendedUse: "design",
  faceLimit: 10_000,
} as const;

describe("generation settings", () => {
  it("accepts a supported configuration", () => {
    expect(generationSettingsSchema.parse(validSettings)).toEqual(validSettings);
  });

  it("rejects misleading or unsafe polygon targets", () => {
    expect(() =>
      generationSettingsSchema.parse({ ...validSettings, faceLimit: 250 }),
    ).toThrow();
    expect(() =>
      generationSettingsSchema.parse({ ...validSettings, faceLimit: 1_000_000 }),
    ).toThrow();
  });
});

describe("generation request", () => {
  it("requires server-verifiable source metadata", () => {
    const result = createGenerationSchema.safeParse({
      projectId: "sample",
      projectName: "Chair",
      settings: validSettings,
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
    });
    expect(result.success).toBe(true);
  });

  it("rejects undersized images and unsupported MIME types", () => {
    const result = createGenerationSchema.safeParse({
      projectId: "sample",
      projectName: "Chair",
      settings: validSettings,
      source: {
        assetId: "33ed9a0c-2747-4f99-b8f3-dc6904964eac",
        name: "chair.gif",
        mimeType: "image/gif",
        size: 2048,
        width: 256,
        height: 256,
        fingerprint: "a".repeat(64),
      },
    });
    expect(result.success).toBe(false);
  });
});
