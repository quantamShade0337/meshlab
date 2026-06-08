"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, BarChart2, Download } from "lucide-react";

const SETTINGS_NAV = [
  { label: "Account", href: "/settings/account", icon: User },
  { label: "Usage", href: "/settings/usage", icon: BarChart2 },
  { label: "Export", href: "/settings/export", icon: Download },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="Settings sections">
      {SETTINGS_NAV.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-2.5 h-9 px-3 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2",
              active
                ? "bg-[#f5f5f5] text-[#0a0a0a] font-medium"
                : "text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]",
            ].join(" ")}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
