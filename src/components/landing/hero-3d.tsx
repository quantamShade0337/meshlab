"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

export function Hero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [readout, setReadout] = useState({ pct: 0, verts: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    // Guard against NaN / out-of-range values from layout measurement so the
    // model's transform never gets poisoned (which would make it vanish).
    const p = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
    progressRef.current = p;
    const build = Math.min(1, Math.max(0, (p - 0.05) / 0.8));
    setReadout({ pct: Math.round(build * 100), verts: Math.round(build * 2841) });
  });

  // Headline fades / lifts away as the model takes the stage.
  const introOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.3], [0, -70]);
  const meshOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0.35]);
  const hudOpacity = useTransform(scrollYProgress, [0.12, 0.3, 0.85, 1], [0, 1, 1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[240vh]">
      {/* Sticky stage */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Atmosphere: grid + mesh gradient */}
        <div className="absolute inset-0 grid-bg grid-fade opacity-70" aria-hidden />
        <motion.div
          style={{ opacity: meshOpacity }}
          className="pointer-events-none absolute inset-0 mesh-gradient mesh-gradient-animated opacity-90"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white"
          aria-hidden
        />

        {/* 3D model fills the stage */}
        <div className="absolute inset-0">
          <HeroCanvas progressRef={progressRef} />
        </div>

        {/* Intro copy */}
        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col items-center justify-center px-6 text-center"
        >
          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#171717] sm:text-7xl">
            Turn an image into an
            <br className="hidden sm:block" />{" "}
            <span className="relative inline-block whitespace-nowrap">
              <span className="relative z-10">editable</span>
              <span
                aria-hidden
                className="absolute inset-x-[-0.08em] bottom-[0.1em] z-0 h-[0.34em] rounded-[2px] bg-[#0070f3]/25"
              />
            </span>{" "}
            3D model.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-[#4d4d4d]">
            Upload a reference, watch the geometry reconstruct, refine it in your
            browser, and export to the tools you already use.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button as="a" href="/projects/new" variant="primary">
              Create a model
            </Button>
            <Button as="a" href="#showcase" variant="secondary">
              See it move <ArrowRight size={15} />
            </Button>
          </div>

          <motion.div
            style={{ opacity: cueOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#888]"
          >
            <span className="eyebrow">Scroll to reconstruct</span>
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Build HUD — appears as you scroll, reads like a generation console */}
        <motion.div
          style={{ opacity: hudOpacity }}
          className="pointer-events-none absolute bottom-10 left-1/2 z-10 w-[min(92vw,440px)] -translate-x-1/2 rounded-xl border border-[#ebebeb] bg-white/80 p-4 shadow-float backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="eyebrow">Reconstructing geometry</span>
            <span className="font-mono text-xs text-[#171717]">{readout.pct}%</span>
          </div>
          <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-[#ebebeb]">
            <div
              className="h-full rounded-full bg-[#171717] transition-[width] duration-100"
              style={{ width: `${readout.pct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-[#888]">
            <span>vertices {readout.verts.toLocaleString()}</span>
            <span>arc-chair.glb</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
