"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GuestAccountSettings() {
  const [displayName, setDisplayName] = useState("Guest creator");
  const [saved, setSaved] = useState(false);

  function save() {
    localStorage.setItem("meshlab-guest-display-name", displayName);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl">
      <div className="mb-8 flex items-start gap-2 rounded-lg border border-[#0070f3]/20 bg-[#fff8f0] p-3">
        <Info
          size={14}
          className="mt-0.5 flex-shrink-0 text-[#0070f3]"
          aria-hidden="true"
        />
        <p className="text-sm leading-6 text-[#737373]">
          You are using the explicit development guest session. Connect Clerk
          to manage verified email addresses, passwords, and social accounts.
        </p>
      </div>

      <label
        htmlFor="display-name"
        className="mb-1.5 block text-sm font-medium text-[#0a0a0a]"
      >
        Local display name
      </label>
      <input
        id="display-name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        className="h-9 w-full max-w-sm rounded-md border border-[#e5e5e5] bg-white px-3 text-sm text-[#0a0a0a] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
      />

      <div className="mt-5">
        <Button
          variant={saved ? "secondary" : "primary"}
          size="sm"
          onClick={save}
        >
          {saved ? "Saved locally" : "Save local preference"}
        </Button>
      </div>
    </div>
  );
}
