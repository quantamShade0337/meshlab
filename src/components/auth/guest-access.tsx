import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { safeRedirectPath } from "@/lib/auth-config";

export function GuestAccess({
  mode,
  redirectUrl,
  guestEnabled,
}: {
  mode: "login" | "signup";
  redirectUrl?: string;
  guestEnabled: boolean;
}) {
  const redirect = safeRedirectPath(redirectUrl);
  const isLogin = mode === "login";

  return (
    <AuthShell
      title={isLogin ? "Sign in to Meshlab" : "Create your Meshlab account"}
      description="Clerk is the production identity provider. Add Clerk keys to enable password, email-link, and configured social sign-in."
      footer={
        <>
          {isLogin ? "New to Meshlab? " : "Already have an account? "}
          <Link
            href={isLogin ? "/signup" : "/login"}
            className="font-medium text-[#0a0a0a] underline underline-offset-4"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </>
      }
    >
      <div className="rounded-md border border-[#0070f3]/20 bg-[#fff8f0] p-3 text-sm leading-6 text-[#737373]">
        Authentication credentials are not configured in this environment.
      </div>
      {guestEnabled ? (
        <>
          <form action="/api/auth/guest" method="post" className="mt-4">
            <input type="hidden" name="redirect_url" value={redirect} />
            <button className="h-10 w-full rounded-md bg-[#0070f3] px-4 text-sm font-medium text-white transition-colors hover:bg-[#0761d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] focus-visible:ring-offset-2">
              Continue in development guest mode
            </button>
          </form>
          <p className="mt-3 text-xs leading-5 text-[#737373]">
            Guest data stays in this browser.
          </p>
        </>
      ) : (
        <p className="mt-4 text-xs leading-5 text-[#737373]">
          Configure Clerk keys or explicitly enable development guest mode to
          continue.
        </p>
      )}
    </AuthShell>
  );
}
