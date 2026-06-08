import { NextResponse } from "next/server";
import { requireGenerationOwner } from "@/lib/generation/owner";
import { SAMPLE_SOURCE_IMAGE } from "@/lib/sample-data";
import { saveSourceAsset } from "@/lib/uploads/source-assets";
import {
  validateBundledSample,
  validateUploadedImage,
} from "@/lib/uploads/validate-image";

export const runtime = "nodejs";

function sampleBytes() {
  const encoded = SAMPLE_SOURCE_IMAGE.slice(SAMPLE_SOURCE_IMAGE.indexOf(",") + 1);
  return new TextEncoder().encode(decodeURIComponent(encoded));
}

export async function POST(request: Request) {
  try {
    const ownerId = await requireGenerationOwner();
    const form = await request.formData();
    const sampleId = form.get("sampleId");
    const file = form.get("file");

    const validated =
      sampleId === "arc-chair"
        ? await validateBundledSample(sampleBytes())
        : file instanceof File
          ? await validateUploadedImage(file)
          : null;

    if (!validated) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const asset = saveSourceAsset({
      id: crypto.randomUUID(),
      ownerId,
      ...validated,
      createdAt: new Date().toISOString(),
    });

    const { bytes: _bytes, ownerId: _ownerId, ...publicAsset } = asset;
    void _bytes;
    void _ownerId;
    return NextResponse.json({ asset: publicAsset }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The image could not be uploaded.",
      },
      { status: 422 },
    );
  }
}
