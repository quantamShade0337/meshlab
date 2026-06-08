import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 text-[#171717] transition-opacity hover:opacity-80 ${className}`}
      aria-label="Meshlab home"
    >
      {/* Isometric cube mark — a nod to mesh / 3D geometry */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M12 2 L12 12 M12 12 L21 7 M12 12 L3 7"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          className="opacity-50"
        />
        <path d="M12 12 L12 22" stroke="currentColor" strokeWidth="1.4" className="opacity-25" />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">Meshlab</span>
    </Link>
  );
}
