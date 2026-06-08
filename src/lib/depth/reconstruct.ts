"use client";

/**
 * On-device monocular depth estimation via transformers.js (Depth Anything v2).
 * Runs entirely in the browser — no API key, no per-use cost, image never leaves
 * the device. Model weights are fetched once from the Hugging Face CDN and then
 * cached by the browser.
 */

export interface DepthMap {
  data: Uint8Array; // grayscale, length = width * height (brighter = nearer)
  width: number;
  height: number;
}

export type DepthProgress =
  | { phase: "downloading"; file?: string; progress?: number }
  | { phase: "analyzing" }
  | { phase: "ready" };

const MODEL_ID = "onnx-community/depth-anything-v2-small";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let estimatorPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getEstimator(onProgress?: (p: DepthProgress) => void): Promise<any> {
  if (estimatorPromise) return estimatorPromise;

  estimatorPromise = (async () => {
    const { pipeline, env } = await import("@huggingface/transformers");
    // Only pull weights from the HF Hub (never look for local model files).
    env.allowLocalModels = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const progress_callback = (e: any) => {
      if (e?.status === "progress") {
        onProgress?.({ phase: "downloading", file: e.file, progress: e.progress });
      }
    };

    // Prefer WebGPU when available; fall back to WASM for broad support.
    try {
      if (typeof navigator !== "undefined" && "gpu" in navigator) {
        return await pipeline("depth-estimation", MODEL_ID, {
          device: "webgpu",
          progress_callback,
        });
      }
    } catch {
      // fall through to the default (WASM) backend
    }
    return await pipeline("depth-estimation", MODEL_ID, { progress_callback });
  })();

  return estimatorPromise;
}

export async function estimateDepth(
  image: string,
  onProgress?: (p: DepthProgress) => void,
): Promise<DepthMap> {
  const estimator = await getEstimator(onProgress);
  onProgress?.({ phase: "analyzing" });

  const output = await estimator(image);
  const depth = output?.depth ?? output;
  if (!depth?.data || !depth.width || !depth.height) {
    throw new Error("Depth estimation returned an unexpected result.");
  }

  // RawImage may carry multiple channels; collapse to one grayscale channel.
  const channels = depth.channels ?? 1;
  const { width, height } = depth;
  let data: Uint8Array;
  if (channels === 1) {
    data = Uint8Array.from(depth.data);
  } else {
    data = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) data[i] = depth.data[i * channels];
  }

  onProgress?.({ phase: "ready" });
  return { data, width, height };
}
