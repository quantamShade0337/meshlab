"use client";

import { useEffect, useState } from "react";
import { estimateDepth, type DepthMap } from "./reconstruct";

export type DepthStatus = "idle" | "loading" | "ready" | "error";

export interface DepthReconstruction {
  depth: DepthMap | null;
  status: DepthStatus;
  message: string;
}

/** Runs on-device depth estimation for an image (data URL), tracking progress. */
export function useDepthReconstruction(image: string | null): DepthReconstruction {
  const [depth, setDepth] = useState<DepthMap | null>(null);
  const [status, setStatus] = useState<DepthStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // No image → nothing to do. The consumer renders the relief only when both
    // `sourceImage` and `depth` are present, so stale state is never shown.
    if (!image) return;

    let active = true;
    // All state transitions happen inside async callbacks (progress / resolve /
    // reject) — never synchronously within the effect body.
    estimateDepth(image, (p) => {
      if (!active) return;
      setStatus("loading");
      if (p.phase === "downloading") {
        setMessage(`Downloading model… ${Math.round(p.progress ?? 0)}%`);
      } else if (p.phase === "analyzing") {
        setDepth(null);
        setMessage("Analyzing image depth…");
      }
    })
      .then((d) => {
        if (!active) return;
        setDepth(d);
        setStatus("ready");
        setMessage("");
      })
      .catch((e) => {
        if (!active) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Reconstruction failed.");
      });

    return () => {
      active = false;
    };
  }, [image]);

  return { depth, status, message };
}
