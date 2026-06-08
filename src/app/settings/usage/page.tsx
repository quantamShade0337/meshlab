import { SettingsNav } from "@/components/settings/settings-nav";
import { Info } from "lucide-react";

export const metadata = {
  title: "Usage — Meshlab Settings",
};

const USAGE_ROWS = [
  { label: "Models generated", value: "1", limit: "—" },
  { label: "Storage used", value: "—", limit: "—" },
  { label: "Exports this month", value: "0", limit: "—" },
];

export default function UsageSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold text-[#0a0a0a] mb-8">Settings</h1>

      <div className="flex gap-10">
        <div className="w-40 flex-shrink-0">
          <SettingsNav />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-[#0a0a0a] mb-6">Usage</h2>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#fff8f0] border border-[#0070f3]/20 mb-8">
            <Info size={14} className="text-[#0070f3] mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-[#737373]">
              Usage tracking is not yet connected. Figures below reflect local session data only.
            </p>
          </div>

          <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#737373]">
                    Metric
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#737373]">
                    Used
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#737373]">
                    Limit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5f5f5]">
                {USAGE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td className="px-4 py-3 text-[#0a0a0a]">{row.label}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#0a0a0a]">{row.value}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#737373]">{row.limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
