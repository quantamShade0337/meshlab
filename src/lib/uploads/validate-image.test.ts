import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { validateUploadedImage } from "./validate-image";

describe("server image validation", () => {
  it("uses decoded bytes instead of trusting the client MIME type", async () => {
    const png = await sharp({
      create: {
        width: 512,
        height: 512,
        channels: 4,
        background: "#ffffff",
      },
    })
      .png()
      .toBuffer();
    const spoofed = new File([new Uint8Array(png)], "../../chair.exe", {
      type: "application/octet-stream",
    });

    const validated = await validateUploadedImage(spoofed);
    expect(validated.mimeType).toBe("image/png");
    expect(validated.name).toBe("chair.exe");
    expect(validated.width).toBe(512);
    expect(validated.fingerprint).toHaveLength(64);
  });

  it("rejects images that decode below the minimum dimensions", async () => {
    const tiny = await sharp({
      create: {
        width: 128,
        height: 128,
        channels: 3,
        background: "#ffffff",
      },
    })
      .jpeg()
      .toBuffer();

    await expect(
      validateUploadedImage(new File([new Uint8Array(tiny)], "tiny.jpg", { type: "image/jpeg" })),
    ).rejects.toThrow("at least 512 × 512");
  });

  it("rejects bytes that are not an image", async () => {
    await expect(
      validateUploadedImage(
        new File(["not an image"], "fake.png", { type: "image/png" }),
      ),
    ).rejects.toThrow("could not be decoded");
  });
});
