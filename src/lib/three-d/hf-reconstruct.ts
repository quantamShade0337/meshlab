import "server-only";

import { Client, handle_file } from "@gradio/client";

/**
 * Accurate, full-360° image→3D via a free Hugging Face Space (TRELLIS by
 * default). Runs server-side (e.g. on Railway). Requires a free HF token.
 *
 * The Space and its parameters are env-configurable so the exact endpoint
 * contract can be tuned without code changes:
 *   HF_TOKEN              (required)  e.g. hf_xxx
 *   HF_SPACE_ID           default: JeffreyXiang/TRELLIS
 *   HF_3D_SS_STEPS        default: 12
 *   HF_3D_SLAT_STEPS      default: 12
 *   HF_3D_MESH_SIMPLIFY   default: 0.95
 *   HF_3D_TEXTURE_SIZE    default: 1024
 */

export interface Reconstruct3DResult {
  glb: Uint8Array;
  mimeType: "model/gltf-binary";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstFileUrl(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value.url) return value.url as string;
  if (Array.isArray(value)) {
    for (const v of value) {
      const u = firstFileUrl(v);
      if (u) return u;
    }
  }
  return undefined;
}

export async function reconstruct3DFromImage(image: Blob): Promise<Reconstruct3DResult> {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error(
      "Accurate 360° reconstruction needs a free Hugging Face token. Set HF_TOKEN in your environment.",
    );
  }

  const space = process.env.HF_SPACE_ID ?? "JeffreyXiang/TRELLIS";
  const ssSteps = Number(process.env.HF_3D_SS_STEPS ?? 12);
  const slatSteps = Number(process.env.HF_3D_SLAT_STEPS ?? 12);
  const meshSimplify = Number(process.env.HF_3D_MESH_SIMPLIFY ?? 0.95);
  const textureSize = Number(process.env.HF_3D_TEXTURE_SIZE ?? 1024);

  const app = await Client.connect(space, { token: token as `hf_${string}` });

  // Some Spaces require an explicit session; ignore if the endpoint is absent.
  try {
    await app.predict("/start_session", []);
  } catch {
    /* no-op */
  }

  // 1) preprocess (background removal / framing)
  const pre = await app.predict("/preprocess_image", [handle_file(image)]);
  const processed = (pre.data as unknown[])[0];

  // 2) image → 3D (returns a preview + the pipeline state)
  const gen = await app.predict("/image_to_3d", [
    processed,
    0, // seed
    7.5, // ss guidance strength
    ssSteps,
    3, // slat guidance strength
    slatSteps,
  ]);
  const state = (gen.data as unknown[])[1];

  // 3) extract a GLB from the state
  const out = await app.predict("/extract_glb", [state, meshSimplify, textureSize]);
  const url = firstFileUrl(out.data);
  if (!url) {
    throw new Error("The 3D Space did not return a GLB file.");
  }

  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    throw new Error(`Failed to download the generated GLB (${res.status}).`);
  }

  return {
    glb: new Uint8Array(await res.arrayBuffer()),
    mimeType: "model/gltf-binary",
  };
}
