import { NextResponse } from "next/server";
import { requireGenerationOwner } from "@/lib/generation/owner";
import { reconstruct3DFromImage } from "@/lib/three-d/hf-reconstruct";

export const runtime = "nodejs";
// Full 360° reconstruction can take a while on a free GPU Space.
export const maxDuration = 300;

function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",");
  const meta = dataUrl.slice(0, comma);
  const base64 = dataUrl.slice(comma + 1);
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? "image/png";
  return new Blob([Buffer.from(base64, "base64")], { type: mime });
}

export async function POST(request: Request) {
  try {
    await requireGenerationOwner();

    const { image } = (await request.json()) as { image?: string };
    if (typeof image !== "string" || !image.startsWith("data:")) {
      return NextResponse.json({ error: "Provide an image data URL." }, { status: 400 });
    }

    const { glb } = await reconstruct3DFromImage(dataUrlToBlob(image));
    const base64 = Buffer.from(glb).toString("base64");

    return NextResponse.json(
      { glb: `data:model/gltf-binary;base64,${base64}` },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "3D reconstruction failed.",
      },
      { status: 502 },
    );
  }
}
