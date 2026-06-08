import { SignUp } from "@clerk/nextjs";
import { GuestAccess } from "@/components/auth/guest-access";
import {
  isClerkConfigured,
  isGuestModeEnabled,
  safeRedirectPath,
} from "@/lib/auth-config";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url: redirectUrl } = await searchParams;

  if (!isClerkConfigured()) {
    return (
      <GuestAccess
        mode="signup"
        redirectUrl={redirectUrl}
        guestEnabled={isGuestModeEnabled()}
      />
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#fafafa] px-6 py-12">
      <SignUp
        signInUrl="/login"
        fallbackRedirectUrl={safeRedirectPath(redirectUrl)}
        appearance={{
          variables: {
            colorPrimary: "#0070f3",
            colorText: "#0a0a0a",
            colorTextSecondary: "#737373",
            borderRadius: "0.5rem",
          },
          elements: {
            cardBox: "shadow-none",
            card: "border border-[#e5e5e5] shadow-none",
            footerActionLink: "text-[#0070f3]",
          },
        }}
      />
    </main>
  );
}
