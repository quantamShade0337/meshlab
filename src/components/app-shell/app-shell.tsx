"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Help", href: "/help", icon: HelpCircle },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({
  children,
  clerkEnabled = false,
  guestEnabled = false,
}: {
  children: React.ReactNode;
  clerkEnabled?: boolean;
  guestEnabled?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-[#e5e5e5] bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left: wordmark */}
          <div className="flex items-center gap-6">
            <Link
              href="/projects"
              className="text-[15px] font-semibold tracking-tight text-[#0a0a0a] hover:opacity-70 transition-opacity"
              aria-label="Meshlab — go to projects"
            >
              Meshlab
            </Link>

            {/* Nav */}
            <nav
              className="hidden sm:flex items-center gap-1"
              aria-label="App navigation"
            >
              {NAV_LINKS.map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={label}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-1.5 h-8 px-3 rounded-md text-sm transition-colors",
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
          </div>

          {/* Right: auth state */}
          <div className="flex items-center gap-3">
            {guestEnabled ? (
              <span className="hidden sm:inline-flex items-center h-5 px-2 rounded text-[10px] font-medium bg-[#fff8f0] text-[#0070f3] border border-[#0070f3]/20 uppercase tracking-wide select-none">
                Guest mode
              </span>
            ) : null}

            {clerkEnabled ? (
              <UserButton
                userProfileUrl="/settings/account"
                appearance={{ elements: { avatarBox: "size-8" } }}
              />
            ) : guestEnabled ? (
              <form action="/api/auth/guest/sign-out" method="post">
                <button
                  className="flex items-center gap-1.5 h-8 px-2 rounded-md bg-[#f5f5f5] text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
                  aria-label="Leave guest mode"
                >
                  <LogOut size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">Leave guest</span>
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center size-8 rounded-full bg-[#f5f5f5] text-[#737373] hover:text-[#0a0a0a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2"
                aria-label="Sign in"
              >
                <User size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          className="sm:hidden flex border-t border-[#e5e5e5] overflow-x-auto"
          aria-label="App navigation"
        >
          {NAV_LINKS.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                  active
                    ? "text-[#0a0a0a] font-medium"
                    : "text-[#737373] hover:text-[#0a0a0a]",
                ].join(" ")}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
