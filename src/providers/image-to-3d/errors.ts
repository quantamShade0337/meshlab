import type { GenerationError, GenerationErrorCode } from "./types";

const PUBLIC_ERRORS: Record<GenerationErrorCode, GenerationError> = {
  provider_unavailable: {
    code: "provider_unavailable",
    message: "The generation service is temporarily unavailable.",
    retryable: true,
    actions: ["retry"],
  },
  provider_rejected_input: {
    code: "provider_rejected_input",
    message: "The generation service could not accept this image or configuration.",
    retryable: false,
    actions: ["adjust_settings", "replace_image"],
  },
  image_processing_failed: {
    code: "image_processing_failed",
    message: "The object could not be reconstructed from this reference.",
    retryable: true,
    actions: ["retry", "replace_image"],
  },
  generation_timed_out: {
    code: "generation_timed_out",
    message: "Generation took too long and was stopped.",
    retryable: true,
    actions: ["retry", "adjust_settings"],
  },
  output_missing: {
    code: "output_missing",
    message: "Generation finished, but no model file was returned.",
    retryable: true,
    actions: ["retry"],
  },
  output_corrupt: {
    code: "output_corrupt",
    message: "The returned model could not be validated.",
    retryable: true,
    actions: ["retry"],
  },
  texture_generation_failed: {
    code: "texture_generation_failed",
    message: "The mesh was created, but texture generation failed.",
    retryable: true,
    actions: ["retry", "without_textures"],
  },
  asset_storage_failed: {
    code: "asset_storage_failed",
    message: "The model was created but could not be stored.",
    retryable: true,
    actions: ["retry"],
  },
  cancelled: {
    code: "cancelled",
    message: "Generation was cancelled.",
    retryable: true,
    actions: ["retry"],
  },
  unknown: {
    code: "unknown",
    message: "Generation failed unexpectedly.",
    retryable: true,
    actions: ["retry"],
  },
};

export function publicGenerationError(code: GenerationErrorCode) {
  return { ...PUBLIC_ERRORS[code], actions: [...PUBLIC_ERRORS[code].actions] };
}

