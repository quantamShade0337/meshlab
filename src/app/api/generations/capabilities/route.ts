import { NextResponse } from "next/server";
import { getPublicProviderCapabilities } from "@/providers/image-to-3d/provider-factory";

export async function GET() {
  return NextResponse.json(getPublicProviderCapabilities());
}
