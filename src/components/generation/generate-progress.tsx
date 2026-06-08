"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  Loader2,
  RotateCcw,
  Settings2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GENERATION_STAGES,
  isTerminalStatus,
  type GenerationJob,
  type GenerationStage,
} from "@/providers/image-to-3d/types";

const STAGE_COPY: Record<GenerationStage, { label: string; description: string }> = {
  preparing_image: {
    label: "Preparing image",
    description: "Validating and preparing your reference.",
  },
  analysing_shape: {
    label: "Analysing shape",
    description: "Identifying the object’s visible form and proportions.",
  },
  creating_viewpoints: {
    label: "Creating viewpoints",
    description: "Estimating how the object may appear from unseen angles.",
  },
  reconstructing_geometry: {
    label: "Reconstructing geometry",
    description: "Building the initial three-dimensional surface.",
  },
  cleaning_mesh: {
    label: "Cleaning mesh",
    description: "Removing small defects and preparing the geometry.",
  },
  generating_textures: {
    label: "Generating textures",
    description: "Projecting the object’s appearance onto the model.",
  },
  preparing_editor: {
    label: "Preparing editor",
    description: "Optimising the model for interactive editing.",
  },
  complete: {
    label: "Complete",
    description: "The model and its metadata are ready.",
  },
};

function visibleStages(job: GenerationJob | null) {
  return GENERATION_STAGES.filter(
    (stage) => stage !== "generating_textures" || job?.settings.textures !== false,
  );
}

export function GenerateProgress({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);
  const failedPolls = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setSourcePreview(sessionStorage.getItem("meshlab_generation_source"));
      } catch {
        setSourcePreview(null);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const readJob = useCallback(async () => {
    if (!jobId) {
      setRequestError("This generation link is missing its job identifier.");
      return null;
    }
    const response = await fetch(`/api/generations/${encodeURIComponent(jobId)}`, {
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Could not read generation status.");
    setJob(payload.job);
    setRequestError(null);
    failedPolls.current = 0;
    return payload.job as GenerationJob;
  }, [jobId]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      if (cancelled) return;
      if (document.hidden) {
        timer = setTimeout(poll, 2_000);
        return;
      }

      try {
        const next = await readJob();
        if (!next || isTerminalStatus(next.status) || cancelled) return;
        timer = setTimeout(poll, next.status === "submitted" ? 900 : 1_500);
      } catch (error) {
        failedPolls.current += 1;
        setRequestError(
          failedPolls.current >= 3
            ? "Connection interrupted. Meshlab will keep trying."
            : error instanceof Error
              ? error.message
              : "Could not read generation status.",
        );
        const delay = Math.min(1_000 * 2 ** failedPolls.current, 15_000);
        timer = setTimeout(poll, delay);
      }
    };

    poll();
    const resume = () => {
      if (!document.hidden && !cancelled && !isTerminalStatus(job?.status ?? "queued")) {
        if (timer) clearTimeout(timer);
        poll();
      }
    };
    document.addEventListener("visibilitychange", resume);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [jobId, readJob, job?.status]);

  const cancel = async () => {
    if (!jobId || mutating) return;
    setMutating(true);
    try {
      const response = await fetch(`/api/generations/${encodeURIComponent(jobId)}/cancel`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setJob(payload.job);
    } catch {
      setRequestError("Could not cancel generation. Check the job status and try again.");
    } finally {
      setMutating(false);
    }
  };

  const retry = async () => {
    if (!jobId || mutating) return;
    setMutating(true);
    try {
      const response = await fetch(`/api/generations/${encodeURIComponent(jobId)}/retry`, {
        method: "POST",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      router.replace(`/projects/sample/generate?job=${payload.job.id}`);
    } catch {
      setRequestError("Could not retry generation. Try adjusting the source or settings.");
      setMutating(false);
    }
  };

  const stages = visibleStages(job);
  const stageIndex = job ? stages.indexOf(job.stage) : 0;
  const complete = job?.status === "succeeded";
  const failed = job?.status === "failed" || job?.status === "timed_out";
  const cancelled = job?.status === "cancelled";
  const activeCopy = job ? STAGE_COPY[job.stage] : STAGE_COPY.preparing_image;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#737373]">
          {job?.status.replace("_", " ") ?? "Loading job"}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
          {complete
            ? "Your model is ready"
            : cancelled
              ? "Generation cancelled"
              : failed
                ? "Generation needs attention"
                : "Generating model"}
        </h1>
        <p className="mt-2 text-sm text-[#737373]">
          {complete
            ? "The generated asset passed the provider response checks and is ready for the editor."
            : "This job is stored on the server. You can safely refresh or return later."}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-xl border border-[#e5e5e5] bg-white p-6">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff3ed] text-[#e94b10]">
              {complete ? (
                <CheckCircle2 size={19} />
              ) : failed || cancelled ? (
                <XCircle size={19} />
              ) : (
                <Loader2 size={19} className="animate-spin" />
              )}
            </div>
            <div>
              <p className="font-medium text-[#0a0a0a]">{activeCopy.label}</p>
              <p className="mt-1 text-sm leading-6 text-[#737373]">
                {job?.error?.message ?? activeCopy.description}
              </p>
            </div>
          </div>

          <ol className="space-y-3" aria-label="Generation stages">
            {stages.map((stage, index) => {
              const done = complete || index < stageIndex;
              const active = !complete && !failed && !cancelled && index === stageIndex;
              return (
                <li key={stage} className="flex items-center gap-3">
                  {done ? (
                    <CheckCircle2 size={17} className="text-emerald-600" aria-hidden />
                  ) : active ? (
                    <Loader2 size={17} className="animate-spin text-[#e94b10]" aria-hidden />
                  ) : (
                    <span className="size-[17px] rounded-full border-2 border-[#e5e5e5]" />
                  )}
                  <span
                    className={`text-sm ${
                      done || active ? "font-medium text-[#0a0a0a]" : "text-[#a3a3a3]"
                    }`}
                  >
                    {STAGE_COPY[stage].label}
                  </span>
                </li>
              );
            })}
          </ol>

          {requestError && (
            <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden />
              {requestError}
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {complete ? (
              <>
                <Button variant="primary" onClick={() => router.push("/projects/sample/editor")}>
                  Open editor
                </Button>
                <Button as="a" href="/projects/sample" variant="secondary">
                  Back to project
                </Button>
              </>
            ) : failed || cancelled ? (
              <>
                {job?.error?.retryable !== false && (
                  <Button variant="primary" onClick={retry} disabled={mutating}>
                    <RotateCcw size={14} aria-hidden />
                    {mutating ? "Retrying…" : "Retry generation"}
                  </Button>
                )}
                <Button as="a" href="/projects/new" variant="secondary">
                  <Settings2 size={14} aria-hidden />
                  Adjust settings
                </Button>
                <Button as="a" href="/projects/new" variant="secondary">
                  <Upload size={14} aria-hidden />
                  Replace image
                </Button>
              </>
            ) : (
              <button
                onClick={cancel}
                disabled={!job || mutating}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#e5e5e5] px-4 text-sm font-medium text-[#737373] transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={14} aria-hidden />
                {mutating ? "Cancelling…" : "Cancel generation"}
              </button>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-[#f7f7f7]">
            <div className="aspect-square">
              {sourcePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sourcePreview}
                  alt="Generation source reference"
                  className="size-full object-contain"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-[#a3a3a3]">
                  <ImageIcon size={22} aria-hidden />
                  <span className="text-xs">Preview unavailable after this session</span>
                </div>
              )}
            </div>
          </div>

          {job && (
            <div className="rounded-xl border border-[#e5e5e5] p-4 text-sm">
              <p className="font-medium text-[#0a0a0a]">{job.projectName}</p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#737373]">Provider</dt>
                  <dd className="font-mono text-[#0a0a0a]">{job.provider}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#737373]">Quality</dt>
                  <dd className="capitalize text-[#0a0a0a]">{job.settings.quality}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#737373]">Face target</dt>
                  <dd className="font-mono text-[#0a0a0a]">
                    {job.settings.faceLimit.toLocaleString()}
                  </dd>
                </div>
                {job.result && (
                  <div className="flex justify-between gap-3 border-t border-[#f0f0f0] pt-2">
                    <dt className="text-[#737373]">Output</dt>
                    <dd className="font-mono uppercase text-[#0a0a0a]">
                      {job.result.format} · {job.result.faces.toLocaleString()} faces
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
