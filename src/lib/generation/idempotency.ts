import type { CreateGenerationRequest } from "@/providers/image-to-3d/types";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createGenerationIdempotencyKey(
  ownerId: string,
  input: CreateGenerationRequest,
) {
  return sha256(
    stableStringify({
      ownerId,
      projectId: input.projectId,
      source: input.source.fingerprint,
      settings: input.settings,
      regenerateNonce: input.regenerateNonce ?? null,
    }),
  );
}

