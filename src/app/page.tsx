import { Nav } from "@/components/ui/nav";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ProductDemo } from "@/components/landing/product-demo";
import { Hero3D } from "@/components/landing/hero-3d";
import { Reveal } from "@/components/landing/reveal";
import { ArrowRight, Upload, Boxes, MousePointer2, Download } from "lucide-react";
import { isClerkConfigured } from "@/lib/auth-config";

const exportTargets = ["Blender", "Cinema 4D", "Unity", "Unreal", "Three.js", "USDZ"];

const workflowSteps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload a reference",
    body: "Drop in a photo, sketch, or scan. Meshlab reads depth, contour, and proportion from any clear image.",
  },
  {
    icon: Boxes,
    number: "02",
    title: "Generate the form",
    body: "Start a run and follow every processing stage as the replaceable provider reconstructs a draft mesh.",
  },
  {
    icon: MousePointer2,
    number: "03",
    title: "Refine in your browser",
    body: "Orbit, select, and reshape directly in the viewport. No plugins, no heavy software to install.",
  },
  {
    icon: Download,
    number: "04",
    title: "Export to your tools",
    body: "Download as OBJ, GLB, or USDZ. Hand it straight to Blender, Cinema 4D, or your game engine.",
  },
];

const examples = [
  { label: "Arch chair", tag: "Furniture", verts: "2,841", format: "GLB", from: "#007cf0", to: "#00dfd8" },
  { label: "Ceramic vase", tag: "Decor", verts: "1,204", format: "OBJ", from: "#7928ca", to: "#ff0080" },
  { label: "Hiking boot", tag: "Footwear", verts: "6,022", format: "USDZ", from: "#ff4d4d", to: "#f9cb28" },
];

const codeLines = [
  { t: "$ ", c: "meshlab export arc-chair --format glb", muted: false },
  { t: "", c: "→ reconstructing geometry      done", muted: true },
  { t: "", c: "→ cleaning mesh · 2,841 verts  done", muted: true },
  { t: "", c: "→ baking textures · 1 material done", muted: true },
  { t: "", c: "✓ wrote arc-chair.glb (1.2 MB)", muted: false },
];

export default function Home() {
  return (
    <>
      <Nav clerkEnabled={isClerkConfigured()} />

      <main className="flex-1">
        {/* ── Scroll-driven 3D hero ── */}
        <Hero3D />

        {/* ── Export targets strip ── */}
        <section className="border-y border-[#ebebeb] bg-[#fafafa]">
          <div className="mx-auto max-w-[1200px] px-6 py-8">
            <p className="eyebrow mb-5 text-center">Exports cleanly into</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
              {exportTargets.map((t) => (
                <span key={t} className="text-sm font-medium text-[#888] transition-colors hover:text-[#171717]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Interactive showcase ── */}
        <section id="showcase" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Live viewport</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#171717] sm:text-5xl">
              See it move. Then make it yours.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#4d4d4d]">
              The same editor that ships with every project. Drag to orbit, scroll
              to zoom, and inspect the mesh in real time.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <ProductDemo />
          </Reveal>
        </section>

        {/* ── Workflow ── */}
        <section id="workflow" className="border-t border-[#ebebeb] bg-[#fafafa]">
          <div className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
            <Reveal>
              <p className="eyebrow">Workflow</p>
              <h2 className="mt-3 max-w-xl text-4xl font-semibold tracking-[-0.03em] text-[#171717] sm:text-5xl">
                Four steps from image to asset.
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ebebeb] sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step, i) => (
                <Reveal key={step.number} delay={i * 0.08}>
                  <div className="group h-full bg-white p-7 transition-colors hover:bg-[#fafafa]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#ebebeb] bg-[#fafafa] text-[#171717] transition-colors group-hover:border-[#a1a1a1]">
                        <step.icon size={16} />
                      </span>
                      <span className="font-mono text-sm text-[#d4d4d4]">{step.number}</span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-[#171717]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4d4d4d]">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Examples ── */}
        <section id="examples" className="mx-auto max-w-[1200px] px-6 py-24 sm:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Examples</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-[#171717] sm:text-5xl">
                Built from a single photo.
              </h2>
            </div>
            <a
              href="/projects/new"
              className="group inline-flex items-center gap-1 text-sm font-medium text-[#4d4d4d] transition-colors hover:text-[#171717]"
            >
              Start from scratch
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((ex, i) => (
              <Reveal key={ex.label} delay={i * 0.08}>
                <a
                  href="/projects/new"
                  className="group block overflow-hidden rounded-xl border border-[#ebebeb] bg-white shadow-card transition-shadow hover:shadow-float"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-[#ebebeb] grid-bg">
                    <div
                      className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-90"
                      style={{
                        background: `radial-gradient(60% 60% at 50% 45%, ${ex.from}55, transparent 70%), radial-gradient(50% 50% at 70% 75%, ${ex.to}55, transparent 70%)`,
                      }}
                    />
                    <span className="absolute left-4 top-4 rounded-full border border-[#ebebeb] bg-white/80 px-2.5 py-0.5 font-mono text-[11px] text-[#4d4d4d] backdrop-blur-sm">
                      {ex.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium text-[#171717] group-hover:underline underline-offset-4">
                        {ex.label}
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-[#888]">{ex.verts} verts</p>
                    </div>
                    <span className="rounded-md bg-[#f5f5f5] px-2 py-1 font-mono text-[11px] text-[#171717]">
                      {ex.format}
                    </span>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Dark band: the technical story ── */}
        <section className="bg-[#0a0a0a]">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow !text-[#666]">Built for engineers</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
                From pixels to polygons.
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-[#a1a1a1]">
                Every project is real geometry — not a render. Inspect vertices,
                swap materials, and export production-ready files behind a typed,
                replaceable provider boundary.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button as="a" href="/projects/new" variant="secondary">
                  Create a model
                </Button>
                <Button as="a" href="/help" variant="ghost" className="!text-white hover:!bg-white/10">
                  Read the docs <ArrowRight size={15} />
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#111111] shadow-float">
                <div className="flex items-center gap-1.5 border-b border-[#1f1f1f] px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2a2a2a]" />
                  <span className="ml-2 font-mono text-[11px] text-[#555]">terminal</span>
                </div>
                <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6">
                  {codeLines.map((l, i) => (
                    <div key={i} className={l.muted ? "text-[#666]" : "text-[#ededed]"}>
                      <span className="text-[#00dfd8]">{l.t}</span>
                      {l.c}
                    </div>
                  ))}
                </pre>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="relative overflow-hidden border-t border-[#ebebeb]">
          <div className="pointer-events-none absolute inset-0 mesh-gradient opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-[1200px] px-6 py-28 text-center sm:py-36">
            <Reveal>
              <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-[-0.035em] text-[#171717] sm:text-6xl">
                Start with a single image.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-lg text-[#4d4d4d]">
                Free to try. No installs, no GPU, no waiting on a render farm.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button as="a" href="/projects/new" variant="primary">
                  Create a model
                </Button>
                <Button as="a" href="/projects/sample" variant="secondary">
                  Explore the sample <ArrowRight size={15} />
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ebebeb] bg-[#fafafa]">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-6 py-12 sm:flex-row sm:items-center">
          <Logo />
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            {[
              ["Workflow", "#workflow"],
              ["Showcase", "#showcase"],
              ["Examples", "#examples"],
              ["Help", "/help"],
              ["Privacy", "/privacy"],
              ["Terms", "/terms"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-sm text-[#4d4d4d] transition-colors hover:text-[#171717]"
              >
                {label}
              </a>
            ))}
          </nav>
          <p className="font-mono text-xs text-[#a1a1a1]">© 2026 Meshlab</p>
        </div>
      </footer>
    </>
  );
}
