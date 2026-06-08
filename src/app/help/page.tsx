"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Upload,
  Box,
  Download,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const DOCS = [
  {
    icon: Upload,
    title: "Uploading a reference",
    body: "Meshlab accepts PNG, JPEG, and WEBP images up to 20 MB. The image must be at least 512×512 pixels. A clear, well-lit photo of a single object on a neutral background gives the best results. You can drag and drop, use the file picker, or paste directly from the clipboard.",
  },
  {
    icon: Box,
    title: "Generation settings",
    body: "Quality controls the depth of reconstruction passes — Fast is useful for quick exploration, Detailed runs more passes. Style shapes the output topology: Original preserves the reference, Clean smooths and simplifies, Stylised exaggerates form. Symmetry mirrors geometry across the vertical axis and works best for symmetrical objects.",
  },
  {
    icon: Download,
    title: "Exporting your model",
    body: "From the editor, choose Export and select GLB, OBJ, or USDZ. GLB is self-contained and works in most real-time contexts. OBJ bundles into a zip with textures. USDZ is required for Apple AR Quick Look. Default formats can be set in Settings → Export.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What image types are supported?",
    a: "PNG, JPEG, and WEBP. The file must be under 20 MB and at least 512×512 pixels after decoding.",
  },
  {
    q: "How long does generation take?",
    a: "Processing time varies by quality setting and server load. There is no fixed time — the progress screen shows which stage is active. You can leave the tab open or return to it later.",
  },
  {
    q: "Can I edit the mesh after it is generated?",
    a: "Yes. Open the editor from the project page to orbit, select geometry, and adjust the model before exporting.",
  },
  {
    q: "What does the Symmetry option do?",
    a: "It mirrors the generated geometry across the vertical axis. This is most useful for objects that are symmetrical in the reference image, such as chairs, bottles, or vehicles viewed from the front.",
  },
  {
    q: "Which export format should I use for AR?",
    a: "Use USDZ for Apple AR Quick Look on iOS and macOS. For web-based AR or game engines, GLB is widely supported.",
  },
  {
    q: "What is the Face limit setting?",
    a: "This caps the number of output polygons. Lower values produce simpler meshes that perform better in real-time contexts. Higher values preserve more detail. You can find this under Advanced settings in the project wizard.",
  },
  {
    q: "Can I generate multiple versions of the same image?",
    a: "Yes. From the project page, choose Generate another version. Each run uses the same source image and creates a new version in the history.",
  },
  {
    q: "Is my data stored?",
    a: "This prototype keeps guest project state in the browser and uses a mock generation provider. Define retention, deletion, and subprocessors before connecting production storage or generation services.",
  },
];

function DocCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="border border-[#e5e5e5] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-[#0070f3]" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-[#0a0a0a]">{title}</h2>
      </div>
      <p className="text-sm text-[#737373] leading-relaxed">{body}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = `faq-${q.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="border-b border-[#f5f5f5] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-medium text-[#0a0a0a] hover:text-[#0070f3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2 rounded"
      >
        {q}
        <ChevronDown
          size={14}
          className={`text-[#737373] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <p id={id} className="pb-4 text-sm text-[#737373] leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [query, setQuery] = useState("");

  const filteredFaqs = FAQS.filter(
    ({ q, a }) =>
      !query.trim() ||
      q.toLowerCase().includes(query.toLowerCase()) ||
      a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle size={18} className="text-[#0070f3]" aria-hidden="true" />
        <h1 className="text-xl font-semibold text-[#0a0a0a]">Help</h1>
      </div>
      <p className="text-sm text-[#737373] mb-10">
        Documentation and frequently asked questions. Can&apos;t find what you need?{" "}
        <Link
          href="mailto:support@meshlab.example"
          className="text-[#0a0a0a] underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Contact support
        </Link>
        .
      </p>

      {/* Docs */}
      <section aria-labelledby="docs-heading" className="mb-12">
        <h2
          id="docs-heading"
          className="text-xs font-medium uppercase tracking-widest text-[#737373] mb-4"
        >
          Documentation
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DOCS.map((doc) => (
            <DocCard key={doc.title} {...doc} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2
            id="faq-heading"
            className="text-xs font-medium uppercase tracking-widest text-[#737373]"
          >
            Frequently asked questions
          </h2>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search FAQs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search frequently asked questions"
              className="h-8 pl-8 pr-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
            />
          </div>
        </div>

        <div className="border border-[#e5e5e5] rounded-lg px-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))
          ) : (
            <p className="py-8 text-center text-sm text-[#737373]">
              No FAQs match &ldquo;{query}&rdquo;.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
