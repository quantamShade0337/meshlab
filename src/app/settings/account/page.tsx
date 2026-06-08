import { UserProfile } from "@clerk/nextjs";
import { GuestAccountSettings } from "@/components/settings/guest-account-settings";
import { SettingsNav } from "@/components/settings/settings-nav";
import { isClerkConfigured } from "@/lib/auth-config";

export default function AccountSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-xl font-semibold text-[#0a0a0a]">Settings</h1>
      <div className="flex gap-10">
        <div className="w-40 flex-shrink-0">
          <SettingsNav />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-6 text-base font-semibold text-[#0a0a0a]">
            Account
          </h2>
          {isClerkConfigured() ? (
            <UserProfile
              routing="hash"
              appearance={{
                variables: {
                  colorPrimary: "#0070f3",
                  colorText: "#0a0a0a",
                  colorTextSecondary: "#737373",
                  borderRadius: "0.5rem",
                },
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full shadow-none",
                  card: "w-full border border-[#e5e5e5] shadow-none",
                },
              }}
            />
          ) : (
            <GuestAccountSettings />
          )}
        </div>
      </div>
    </div>
  );
}
