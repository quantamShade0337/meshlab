import { AppShell } from "@/components/app-shell/app-shell";
import {
  isClerkConfigured,
} from "@/lib/auth-config";
import { hasGuestSession } from "@/lib/auth-session";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = isClerkConfigured();
  const guestEnabled = await hasGuestSession();

  return (
    <AppShell
      clerkEnabled={clerkEnabled}
      guestEnabled={guestEnabled}
    >
      {children}
    </AppShell>
  );
}
