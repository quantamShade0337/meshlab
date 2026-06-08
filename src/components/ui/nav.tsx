"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Workflow", href: "#workflow" },
  { label: "Showcase", href: "#showcase" },
  { label: "Examples", href: "#examples" },
  { label: "Help", href: "/help" },
];

export function Nav({ clerkEnabled = false }: { clerkEnabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#ebebeb]/80 bg-white/70 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Logo />

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2"
          aria-label="Main navigation"
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {clerkEnabled ? (
            <>
              <Show when="signed-out">
                <Button as="a" href="/login" variant="ghost" size="sm">
                  Sign in
                </Button>
                <Button as="a" href="/signup" variant="primary" size="sm">
                  Sign up
                </Button>
              </Show>
              <Show when="signed-in">
                <Button as="a" href="/projects/new" variant="ghost" size="sm">
                  Create a model
                </Button>
                <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
              </Show>
            </>
          ) : (
            <>
              <Button as="a" href="/login" variant="ghost" size="sm">
                Sign in
              </Button>
              <Button as="a" href="/projects/new" variant="primary" size="sm">
                Create a model
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden rounded-full p-2 text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#ebebeb] bg-white px-6 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-lg px-3 py-2.5 text-sm text-[#4d4d4d] hover:text-[#171717] hover:bg-[#f5f5f5] transition-colors"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[#ebebeb]">
            {clerkEnabled ? (
              <>
                <Show when="signed-out">
                  <Button as="a" href="/login" variant="secondary" size="sm">
                    Sign in
                  </Button>
                  <Button as="a" href="/signup" variant="primary" size="sm">
                    Sign up
                  </Button>
                </Show>
                <Show when="signed-in">
                  <Button as="a" href="/projects/new" variant="primary" size="sm">
                    Create a model
                  </Button>
                  <div className="flex items-center gap-2 pt-1">
                    <UserButton />
                    <span className="text-sm text-[#4d4d4d]">Account</span>
                  </div>
                </Show>
              </>
            ) : (
              <>
                <Button as="a" href="/login" variant="secondary" size="sm">
                  Sign in
                </Button>
                <Button as="a" href="/projects/new" variant="primary" size="sm">
                  Create a model
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
