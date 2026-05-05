/**
 * Supabase session refresh + auth redirects for the App Router.
 * Invoked from `src/proxy.ts` only — this is not a root `middleware.ts` file.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { computeDealRoomAccess, fetchBillingRow } from "@/lib/billing-access";
import { isDemoMode } from "@/lib/demo-flow";
import { mergeBillingForGates } from "@/lib/plan-access";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { isAdmin } from "@/lib/plan-gates";
import { ensureUserProfileFromAuth } from "@/lib/ensure-user-profile";
import { hasCompletedOnboarding } from "@/lib/user-onboarding";

const PRO_PREVIEW_NAV_COOKIE = "aervara_pro_preview";

/** Keeps dashboard shell nav in sync with `?demo=true` on dashboard / properties / city. */
function attachProPreviewNavCookie(
  request: NextRequest,
  user: { id: string } | null,
  response: NextResponse,
): NextResponse {
  if (!user) return response;
  const path = request.nextUrl.pathname;
  const affectsCookie =
    path.startsWith("/dashboard") ||
    path.startsWith("/properties") ||
    path.startsWith("/city");
  if (!affectsCookie) return response;
  const demo = isDemoMode(request.nextUrl.searchParams.get("demo"));
  if (demo) {
    response.cookies.set(PRO_PREVIEW_NAV_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 4,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    response.cookies.delete(PRO_PREVIEW_NAV_COOKIE);
  }
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  /** Public sample workspace: never require login, approval, or onboarding. */
  const isPublicDemoRoute = path === "/demo" || path.startsWith("/demo/");
  if (isPublicDemoRoute) {
    return attachProPreviewNavCookie(request, user, supabaseResponse);
  }

  const isOnboardingPath = path.startsWith("/onboarding");
  const requiresAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/properties") ||
    path.startsWith("/submissions") ||
    path.startsWith("/city") ||
    path.startsWith("/apply") ||
    path.startsWith("/admin") ||
    isOnboardingPath ||
    path.startsWith("/profile");

  if (!user && requiresAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectTarget = `${path}${request.nextUrl.search}`;
    url.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(url);
  }

  if (user && requiresAuth) {
    await ensureUserProfileFromAuth(supabase, user);
  }

  if (user && path === "/login") {
    const redirectRaw = request.nextUrl.searchParams.get("redirect");
    const target =
      redirectRaw != null &&
      redirectRaw.startsWith("/") &&
      !redirectRaw.startsWith("//")
        ? redirectRaw
        : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  if (
    user &&
    (path.startsWith("/dashboard") ||
      path.startsWith("/properties") ||
      path.startsWith("/submissions") ||
      path.startsWith("/city") ||
      path.startsWith("/admin"))
  ) {
    const isDemo = isDemoMode(request.nextUrl.searchParams.get("demo"));
    const exclusivityRow = await fetchExclusivityRow(supabase, user.id);
    const demoBypassesApproval =
      isDemo &&
      (path.startsWith("/dashboard") ||
        path.startsWith("/properties") ||
        path.startsWith("/city"));
    const approved = isApprovedForPlatform(exclusivityRow, {
      isDemo: demoBypassesApproval,
      userId: user.id,
    });
    if (!approved) {
      const url = request.nextUrl.clone();
      url.pathname = "/apply";
      url.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return attachProPreviewNavCookie(
        request,
        user,
        NextResponse.redirect(url),
      );
    }

    if (!(await hasCompletedOnboarding(supabase, user))) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      const nextPath = `${path}${request.nextUrl.search}`;
      url.searchParams.set("next", nextPath);
      return attachProPreviewNavCookie(
        request,
        user,
        NextResponse.redirect(url),
      );
    }
  }

  if (user && path.startsWith("/properties/import")) {
    const importDemo = isDemoMode(request.nextUrl.searchParams.get("demo"));
    if (!importDemo) {
      const [billingRow, exclusivityForImport] = await Promise.all([
        fetchBillingRow(supabase, user.id),
        fetchExclusivityRow(supabase, user.id),
      ]);
      const mergedBilling = mergeBillingForGates(
        billingRow,
        exclusivityForImport,
      );
      if (!computeDealRoomAccess(mergedBilling, user.id, user.email)) {
        const url = request.nextUrl.clone();
        url.pathname = "/apply";
        url.searchParams.set(
          "next",
          `${path}${request.nextUrl.search}`,
        );
        return attachProPreviewNavCookie(
          request,
          user,
          NextResponse.redirect(url),
        );
      }
    }
  }

  if (user && isOnboardingPath) {
    const exclusivityForAdmin = await fetchExclusivityRow(supabase, user.id);
    if (
      isAdmin({
        userId: user.id,
        email: user.email,
        appRole: exclusivityForAdmin?.role ?? null,
      })
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return attachProPreviewNavCookie(
        request,
        user,
        NextResponse.redirect(url),
      );
    }
  }

  return attachProPreviewNavCookie(request, user, supabaseResponse);
}
