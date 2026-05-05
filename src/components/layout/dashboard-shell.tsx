import Link from "next/link";
import { type ReactNode } from "react";
import { cookies } from "next/headers";
import { ProPreviewChrome } from "@/components/billing/pro-preview-chrome";
import { PlanUsagePill } from "@/components/billing/plan-usage-pill";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DemoPreviewBadge } from "@/components/demo/demo-preview-badge";
import { Logo } from "@/components/branding/logo";
import { DashboardAtmosphere } from "@/components/layout/dashboard-atmosphere";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { PlanGateDebugRibbon } from "@/components/dev/plan-gate-debug-ribbon";
import { getPlanAccess } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const PRO_PREVIEW_NAV_COOKIE = "aervara_pro_preview";

const navLinkClass =
  "rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950";

const navLinkClassMobile =
  "rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950";

const signInClass =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-[13px] font-medium text-stone-900 transition-colors duration-200 hover:bg-neutral-100/80 hover:text-stone-950";

export default async function DashboardShell({
  children,
  publicDemo = false,
}: {
  children: ReactNode;
  /** Unauthenticated `/demo` workspace: nav stays on public routes. */
  publicDemo?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const navDemo = cookieStore.get(PRO_PREVIEW_NAV_COOKIE)?.value === "1";

  const publicDemoApply = requestFullAccessHref({
    nextPath: "/demo",
    sourceRoute: "/demo",
  });

  const logoHref = publicDemo
    ? "/demo"
    : withDemoQuery("/dashboard", navDemo);
  const propertiesHref = publicDemo
    ? "/demo"
    : withDemoQuery("/dashboard", navDemo);
  const addPropertyHref = withDemoQuery("/properties/new", navDemo);
  const accessOrPricingHref = publicDemo
    ? publicDemoApply
    : navDemo
      ? requestFullAccessHref({
          nextPath: withDemoQuery("/dashboard", true),
          sourceRoute: withDemoQuery("/dashboard", true),
        })
      : "/pricing";
  const accessOrPricingLabel = publicDemo || navDemo ? "Request Full Access" : "Pricing";
  const profileHref = publicDemo
    ? "/login?redirect=%2Fprofile"
    : withDemoQuery("/profile", navDemo);
  const submissionsHref = publicDemo
    ? "/login?redirect=%2Fsubmissions"
    : withDemoQuery("/submissions", navDemo);

  let usagePill: ReactNode = null;
  if (user) {
    const access = await getPlanAccess(supabase, user.id, user.email);
    if (!navDemo) {
      usagePill = (
        <PlanUsagePill
          propertyCount={access.propertyCount}
          freeLimit={access.freePropertyLimit}
          isPro={access.isPro}
        />
      );
    }
  }

  return (
    <DashboardAtmosphere>
      <div className="min-h-screen bg-transparent">
        <header
          className="sticky top-0 z-30 border-b border-stone-200/50 text-stone-900 shadow-[0_1px_10px_rgba(15,23,42,0.04)]"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.62)",
            WebkitBackdropFilter: "blur(14px) saturate(1.15)",
            backdropFilter: "blur(14px) saturate(1.15)",
          }}
        >
          <div className="mx-auto flex h-[4.75rem] max-w-6xl items-center justify-between px-6 sm:px-10">
            <div className="flex min-w-0 items-center gap-6 sm:gap-10">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <Logo href={logoHref} variant="nav" priority />
                {navDemo && !publicDemo ? <DemoPreviewBadge compact /> : null}
              </div>
              <nav className="hidden items-center gap-1 sm:flex">
                <Link href={propertiesHref} className={navLinkClass}>
                  Properties
                </Link>
                {publicDemo ? (
                  <span
                    className={cn(
                      navLinkClass,
                      "cursor-not-allowed opacity-50 hover:bg-transparent",
                    )}
                    aria-disabled
                  >
                    Add property
                  </span>
                ) : (
                  <Link href={addPropertyHref} className={navLinkClass}>
                    Add property
                  </Link>
                )}
                <Link href={accessOrPricingHref} className={navLinkClass}>
                  {accessOrPricingLabel}
                </Link>
                <Link href={profileHref} className={navLinkClass}>
                  Profile
                </Link>
                <Link href={submissionsHref} className={navLinkClass}>
                  Submissions
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {usagePill}
              {user ? (
                <SignOutButton />
              ) : (
                <Link href="/login?redirect=%2Fdemo" className={signInClass}>
                  Sign in
                </Link>
              )}
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 border-t border-stone-200/60 px-5 py-3 sm:hidden">
            <Link href={propertiesHref} className={navLinkClassMobile}>
              Properties
            </Link>
            {publicDemo ? (
              <span
                className={cn(
                  navLinkClassMobile,
                  "cursor-not-allowed opacity-50 hover:bg-transparent",
                )}
                aria-disabled
              >
                Add property
              </span>
            ) : (
              <Link href={addPropertyHref} className={navLinkClassMobile}>
                Add property
              </Link>
            )}
            <Link href={accessOrPricingHref} className={navLinkClassMobile}>
              {accessOrPricingLabel}
            </Link>
            <Link href={profileHref} className={navLinkClassMobile}>
              Profile
            </Link>
            <Link href={submissionsHref} className={navLinkClassMobile}>
              Submissions
            </Link>
          </nav>
        </header>
        {!publicDemo ? (
          <PlanGateDebugRibbon isProPreview={navDemo} />
        ) : null}
        <ProPreviewChrome />
        <main className="mx-auto max-w-6xl bg-transparent px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          {children}
        </main>
      </div>
    </DashboardAtmosphere>
  );
}
