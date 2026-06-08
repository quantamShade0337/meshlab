import { NextResponse } from "next/server";
import {
  GUEST_COOKIE_NAME,
  isGuestModeEnabled,
  safeRedirectPath,
} from "@/lib/auth-config";

export async function POST(request: Request) {
  if (!isGuestModeEnabled()) {
    return NextResponse.json({ error: "Guest mode is disabled." }, { status: 404 });
  }

  const formData = await request.formData();
  const redirectPath = safeRedirectPath(
    formData.get("redirect_url")?.toString(),
  );
  const response = NextResponse.redirect(new URL(redirectPath, request.url), 303);

  response.cookies.set(GUEST_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
