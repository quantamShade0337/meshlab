import "server-only";

import { cookies } from "next/headers";
import {
  GUEST_COOKIE_NAME,
  isClerkConfigured,
  isGuestModeEnabled,
} from "@/lib/auth-config";

export async function hasGuestSession() {
  if (isClerkConfigured() || !isGuestModeEnabled()) return false;

  return (await cookies()).get(GUEST_COOKIE_NAME)?.value === "1";
}
