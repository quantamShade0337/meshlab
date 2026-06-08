import "server-only";

export const GUEST_COOKIE_NAME = "meshlab_guest";

export function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export function isGuestModeEnabled() {
  if (process.env.ENABLE_GUEST_MODE !== "true") return false;
  if (process.env.NODE_ENV !== "production") return true;

  return process.env.ALLOW_INSECURE_GUEST_MODE_IN_PRODUCTION === "true";
}

export function safeRedirectPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/projects";
  return value;
}
