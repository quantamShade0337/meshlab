import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import {
  GUEST_COOKIE_NAME,
  isClerkConfigured,
  isGuestModeEnabled,
} from "@/lib/auth-config";

const isProtectedRoute = createRouteMatcher([
  "/projects(.*)",
  "/settings(.*)",
]);

const clerkProxy = clerkMiddleware(
  async (auth, request) => {
    if (isProtectedRoute(request)) {
      // Send unauthenticated users to this app's custom /login page
      // (matches the routes defined under /login and /signup), preserving
      // the originally requested path so login can redirect back.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "redirect_url",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      await auth.protect({ unauthenticatedUrl: loginUrl.toString() });
    }
  },
  { signInUrl: "/login", signUpUrl: "/signup" },
);

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  if (isClerkConfigured()) return clerkProxy(request, event);
  if (!isProtectedRoute(request)) return NextResponse.next();

  const hasGuestSession =
    isGuestModeEnabled() &&
    request.cookies.get(GUEST_COOKIE_NAME)?.value === "1";

  if (hasGuestSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "redirect_url",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
