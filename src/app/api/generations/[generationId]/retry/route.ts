import { NextResponse } from "next/server";
import { requireGenerationOwner } from "@/lib/generation/owner";
import { retryGeneration } from "@/lib/generation/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  try {
    const ownerId = await requireGenerationOwner();
    const { generationId } = await params;
    return NextResponse.json(await retryGeneration(ownerId, generationId), {
      status: 201,
    });
  } catch (error) {
    const status =
      error instanceof Error && error.name === "UnauthorizedError"
        ? 401
        : error instanceof Error && error.name === "NotFoundError"
          ? 404
          : 503;
    return NextResponse.json({ error: "Unable to retry generation." }, { status });
  }
}
