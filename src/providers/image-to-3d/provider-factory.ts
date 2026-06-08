import "server-only";

import { MockImageTo3DProvider } from "./mock-provider";
import { RealImageTo3DProviderPlaceholder } from "./real-provider-placeholder";
import type { ImageTo3DProvider } from "./types";

const mockProvider = new MockImageTo3DProvider();
const realPlaceholder = new RealImageTo3DProviderPlaceholder();

export function getImageTo3DProvider(): ImageTo3DProvider {
  return process.env.IMAGE_TO_3D_PROVIDER === "mock" || !process.env.IMAGE_TO_3D_PROVIDER
    ? mockProvider
    : realPlaceholder;
}

export function getPublicProviderCapabilities() {
  const provider = getImageTo3DProvider();
  return { provider: provider.id, capabilities: provider.capabilities };
}
