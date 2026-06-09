import { NextResponse } from "next/server";
import {
  listProjects,
  upsertProject,
  deleteProject,
} from "@/lib/projects/clerk-projects";

export const runtime = "nodejs";

function handle(error: unknown) {
  if (error instanceof Error && error.name === "UnauthorizedError") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Project storage failed." },
    { status: 500 },
  );
}

export async function GET() {
  try {
    return NextResponse.json({ projects: await listProjects() });
  } catch (error) {
    return handle(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      name?: string;
      state?: Record<string, unknown>;
    };
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json({ error: "A project name is required." }, { status: 400 });
    }
    const result = await upsertProject({
      id: body.id,
      name: body.name,
      state: body.state ?? {},
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handle(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "A project id is required." }, { status: 400 });
    }
    return NextResponse.json({ projects: await deleteProject(id) });
  } catch (error) {
    return handle(error);
  }
}
