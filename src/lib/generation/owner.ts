import "server-only";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import {
  GUEST_COOKIE_NAME,
  isClerkConfigured,
  isGuestModeEnabled,
} from "@/lib/auth-config";

export async function requireGenerationOwner() {
  if (isClerkConfigured()) {
    const { userId } = await auth();
    if (userId) return `clerk:${userId}`;
  } else if (
    isGuestModeEnabled() &&
    (await cookies()).get(GUEST_COOKIE_NAME)?.value === "1"
  ) {
    return "guest:local";
  }

  const error = new Error("Authentication required.");
  error.name = "UnauthorizedError";
  throw error;
}

