import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Per-account project storage backed by Clerk user `privateMetadata`.
 * Holds small project *settings* only (no images/meshes — Clerk metadata is
 * capped at ~8KB/user). Tied to the signed-in user; syncs across devices.
 */

export interface StoredProject {
  id: string;
  name: string;
  updatedAt: string;
  /** Editor settings snapshot (transform, material, scene, print/litho config). */
  state: Record<string, unknown>;
}

const MAX_PROJECTS = 20;
const MAX_BYTES = 7000; // stay safely under Clerk's ~8KB metadata limit

function unauthorized(): never {
  const e = new Error("Authentication required.");
  e.name = "UnauthorizedError";
  throw e;
}

async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) unauthorized();
  return userId;
}

async function readProjects(userId: string): Promise<StoredProject[]> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const projects = user.privateMetadata?.projects;
  return Array.isArray(projects) ? (projects as StoredProject[]) : [];
}

async function writeProjects(userId: string, projects: StoredProject[]) {
  // Trim oldest until within Clerk's metadata size budget.
  let next = projects.slice(0, MAX_PROJECTS);
  while (next.length > 1 && JSON.stringify({ projects: next }).length > MAX_BYTES) {
    next = next.slice(0, -1);
  }
  if (JSON.stringify({ projects: next }).length > MAX_BYTES) {
    throw new Error("This project is too large to store on your account.");
  }
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, { privateMetadata: { projects: next } });
  return next;
}

export async function listProjects(): Promise<StoredProject[]> {
  return readProjects(await requireUserId());
}

export async function upsertProject(input: {
  id?: string;
  name: string;
  state: Record<string, unknown>;
}): Promise<{ projects: StoredProject[]; project: StoredProject }> {
  const userId = await requireUserId();
  const existing = await readProjects(userId);
  const id = input.id ?? crypto.randomUUID();
  const project: StoredProject = {
    id,
    name: input.name.trim().slice(0, 120) || "Untitled",
    updatedAt: new Date().toISOString(),
    state: input.state ?? {},
  };
  const projects = [project, ...existing.filter((p) => p.id !== id)];
  const saved = await writeProjects(userId, projects);
  return { projects: saved, project };
}

export async function deleteProject(id: string): Promise<StoredProject[]> {
  const userId = await requireUserId();
  const existing = await readProjects(userId);
  return writeProjects(
    userId,
    existing.filter((p) => p.id !== id),
  );
}
