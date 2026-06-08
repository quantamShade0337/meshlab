import type {
  CreateGenerationRequest,
  ImageTo3DProvider,
  ModelAsset,
  ProviderGeneration,
} from "./types";

/**
 * Integration boundary for a production image-to-3D service.
 *
 * A real adapter must keep credentials server-side, map provider states and
 * errors into internal types, validate returned assets, support polling or
 * verified webhooks, and retrieve assets through private or signed URLs.
 */
export class RealImageTo3DProviderPlaceholder implements ImageTo3DProvider {
  readonly id = "real-placeholder";
  readonly capabilities = {
    textures: false,
    backgroundRemoval: false,
    multiViewInput: false,
    watertightOutput: false,
    polygonTargeting: false,
    seedControl: false,
    cancellation: false,
    webhooks: false,
    progressEvents: false,
    outputFormats: [] as Array<"glb" | "obj" | "usdz" | "stl">,
  };

  private unavailable(): never {
    throw new Error(
      "No real image-to-3D provider is configured. Set IMAGE_TO_3D_PROVIDER=mock or implement this adapter.",
    );
  }

  async createGeneration(_input: CreateGenerationRequest): Promise<ProviderGeneration> {
    void _input;
    return this.unavailable();
  }

  async getGenerationStatus(_providerJobId: string): Promise<ProviderGeneration> {
    void _providerJobId;
    return this.unavailable();
  }

  async getGenerationResult(_providerJobId: string): Promise<ModelAsset> {
    void _providerJobId;
    return this.unavailable();
  }
}
