import Link from "next/link";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#fafafa] px-6 py-12">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <Link
          href="/"
          className="mb-10 text-[15px] font-semibold tracking-tight text-[#0a0a0a]"
        >
          Meshlab
        </Link>
        <div className="w-full rounded-lg border border-[#e5e5e5] bg-white p-6">
          <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            {title}
          </h1>
          <p className="mt-1 text-sm leading-6 text-[#737373]">{description}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-6 border-t border-[#e5e5e5] pt-5 text-sm text-[#737373]">
            {footer}
          </div>
        </div>
      </div>
    </main>
  );
}
