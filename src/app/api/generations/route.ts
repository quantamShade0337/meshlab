import { NextResponse } from "next/server";
import { createGeneration } from "@/lib/generation/service";
import { requireGenerationOwner } from "@/lib/generation/owner";
import { createGenerationSchema } from "@/providers/image-to-3d/types";

export async function POST(request: Request) {
  try {
    const ownerId = await requireGenerationOwner();
    const payload = createGenerationSchema.parse(await request.json());
    const result = await createGeneration(ownerId, payload);
    return NextResponse.json(result, { status: result.deduplicated ? 200 : 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    }
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Generation settings or source metadata are invalid." },
        { status: 422 },
      );
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: "The generation service is temporarily unavailable." },
      { status: 503 },
    );
  }
}

