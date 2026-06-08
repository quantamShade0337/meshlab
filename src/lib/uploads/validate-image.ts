import sharp from "sharp";
import { createHash } from "node:crypto";

const MAX_BYTES = 20 * 1024 * 1024;
const MIN_DIMENSION = 512;
const MAX_DIMENSION = 16_384;
const MIME_BY_FORMAT = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
} as const;

function safeFileName(value: string) {
  const base = value.split(/[\\/]/).pop() ?? "source-image";
  const cleaned = base.replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
  return (cleaned || "source-image").slice(0, 160);
}

async function fingerprint(bytes: Uint8Array) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function validateUploadedImage(file: File) {
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("This image is too large to process.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(bytes, {
      animated: false,
      limitInputPixels: MAX_DIMENSION * MAX_DIMENSION,
      failOn: "warning",
    }).metadata();
  } catch {
    throw new Error("The file could not be decoded as an image.");
  }

  if (!metadata.format || !(metadata.format in MIME_BY_FORMAT)) {
    throw new Error("Use a PNG, JPEG, or WEBP image.");
  }
  if ((metadata.pages ?? 1) > 1) {
    throw new Error("Animated images are not supported.");
  }
  if (!metadata.width || !metadata.height) {
    throw new Error("The image dimensions could not be read.");
  }
  if (metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION) {
    throw new Error("This image is too small. Use an image at least 512 × 512.");
  }
  if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    throw new Error("This image is too large to process.");
  }

  const format = metadata.format as keyof typeof MIME_BY_FORMAT;
  return {
    bytes,
    name: safeFileName(file.name),
    mimeType: MIME_BY_FORMAT[format],
    size: bytes.byteLength,
    width: metadata.width,
    height: metadata.height,
    fingerprint: await fingerprint(bytes),
    isSample: false,
  };
}

export async function validateBundledSample(bytes: Uint8Array) {
  const metadata = await sharp(bytes).metadata();
  return {
    bytes,
    name: "arc-chair-sample.svg",
    mimeType: "image/svg+xml" as const,
    size: bytes.byteLength,
    width: metadata.width ?? 512,
    height: metadata.height ?? 512,
    fingerprint: await fingerprint(bytes),
    isSample: true,
  };
}
