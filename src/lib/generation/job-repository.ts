import "server-only";

import type { GenerationJob } from "@/providers/image-to-3d/types";

interface GenerationStore {
  jobs: Map<string, GenerationJob>;
  idempotency: Map<string, string>;
}

const globalStore = globalThis as typeof globalThis & {
  __meshlabGenerationStore?: GenerationStore;
};

const store =
  globalStore.__meshlabGenerationStore ??
  (globalStore.__meshlabGenerationStore = {
    jobs: new Map(),
    idempotency: new Map(),
  });

export function findJobByIdempotencyKey(key: string) {
  const id = store.idempotency.get(key);
  return id ? store.jobs.get(id) : undefined;
}

export function saveGenerationJob(job: GenerationJob) {
  store.jobs.set(job.id, structuredClone(job));
  store.idempotency.set(job.idempotencyKey, job.id);
  return job;
}

export function getGenerationJob(id: string) {
  const job = store.jobs.get(id);
  return job ? structuredClone(job) : undefined;
}

export function updateGenerationJob(id: string, update: Partial<GenerationJob>) {
  const current = store.jobs.get(id);
  if (!current) return undefined;
  const next = { ...current, ...update, updatedAt: new Date().toISOString() };
  store.jobs.set(id, next);
  return structuredClone(next);
}

