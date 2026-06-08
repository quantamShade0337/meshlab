"use client";

import { useState } from "react";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";

type ExportFormat = "obj" | "glb" | "usdz";

export default function ExportSettingsPage() {
  const [defaultFormat, setDefaultFormat] = useState<ExportFormat>("glb");
  const [includeTextures, setIncludeTextures] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold text-[#0a0a0a] mb-8">Settings</h1>

      <div className="flex gap-10">
        <div className="w-40 flex-shrink-0">
          <SettingsNav />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-6">Export defaults</h2>

          <div className="space-y-6">
            {/* Default format */}
            <div>
              <label
                htmlFor="default-format"
                className="block text-sm font-medium text-[#0a0a0a] mb-1.5"
              >
                Default format
              </label>
              <select
                id="default-format"
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value as ExportFormat)}
                className="h-9 px-3 text-sm border border-[#e5e5e5] rounded-md bg-white text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3] cursor-pointer"
              >
                <option value="glb">GLB — WebGL / game engines</option>
                <option value="obj">OBJ — universal interchange</option>
                <option value="usdz">USDZ — Apple AR Quick Look</option>
              </select>
            </div>

            {/* Include textures */}
            <div className="flex items-center justify-between max-w-sm">
              <div>
                <p className="text-sm font-medium text-[#0a0a0a]">Include textures</p>
                <p className="text-xs text-[#737373]">Embed colour maps in the export.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={includeTextures}
                aria-label="Toggle include textures"
                onClick={() => setIncludeTextures((v) => !v)}
                className={[
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2",
                  includeTextures ? "bg-[#0a0a0a]" : "bg-[#e5e5e5]",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform",
                    includeTextures ? "translate-x-4" : "translate-x-0.5",
                  ].join(" ")}
                />
              </button>
            </div>

            {/* Format notes */}
            <div className="border border-[#e5e5e5] rounded-lg p-4 space-y-3">
              <p className="text-xs font-medium text-[#737373] uppercase tracking-wide">Format notes</p>
              <ul className="space-y-2 text-sm text-[#737373]">
                <li>
                  <span className="font-medium text-[#0a0a0a]">GLB</span> — Self-contained binary
                  with embedded textures. Best for web and real-time use.
                </li>
                <li>
                  <span className="font-medium text-[#0a0a0a]">OBJ</span> — Widely supported.
                  Textures are separate files in a zip.
                </li>
                <li>
                  <span className="font-medium text-[#0a0a0a]">USDZ</span> — Required for Apple
                  AR Quick Look on iOS / macOS.
                </li>
              </ul>
            </div>

            <div>
              <Button
                variant={saved ? "secondary" : "primary"}
                size="sm"
                onClick={handleSave}
              >
                {saved ? "Saved" : "Save defaults"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
