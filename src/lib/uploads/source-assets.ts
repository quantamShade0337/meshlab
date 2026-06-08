import "server-only";

export interface SourceAssetRecord {
  id: string;
  ownerId: string;
  name: string;
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";
  size: number;
  width: number;
  height: number;
  fingerprint: string;
  isSample: boolean;
  bytes: Uint8Array;
  createdAt: string;
}

const globalAssets = globalThis as typeof globalThis & {
  __meshlabSourceAssets?: Map<string, SourceAssetRecord>;
};

const assets =
  globalAssets.__meshlabSourceAssets ??
  (globalAssets.__meshlabSourceAssets = new Map());

export function saveSourceAsset(asset: SourceAssetRecord) {
  assets.set(asset.id, asset);
  return asset;
}

export function getOwnedSourceAsset(ownerId: string, assetId: string) {
  const asset = assets.get(assetId);
  return asset?.ownerId === ownerId ? asset : undefined;
}
