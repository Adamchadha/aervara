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

const PRO_PREVIEW_NAV_COOKIE = "aervara_pro_preview";

export default async function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const navDemo = cookieStore.get(PRO_PREVIEW_NAV_COOKIE)?.value === "1";

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
      {/* Shell has no full-page fill — backdrop shows behind main; nav is opaque frosted glass */}
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
                <Logo href={withDemoQuery("/dashboard", navDemo)} variant="nav" priority />
                {navDemo ? <DemoPreviewBadge compact /> : null}
              </div>
              <nav className="hidden items-center gap-1 sm:flex">
                <Link
                  href={withDemoQuery("/dashboard", navDemo)}
                  className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950"
                >
                  Properties
                </Link>
                <Link
                  href={withDemoQuery("/properties/new", navDemo)}
                  className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950"
                >
                  Add property
                </Link>
                <Link
                  href={
                    navDemo
                      ? requestFullAccessHref({
                          nextPath: withDemoQuery("/dashboard", true),
                          sourceRoute: withDemoQuery("/dashboard", true),
                        })
                      : "/pricing"
                  }
                  className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950"
                >
                  {navDemo ? "Request Full Access" : "Pricing"}
                </Link>
                <Link
                  href={withDemoQuery("/profile", navDemo)}
                  className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950"
                >
                  Profile
                </Link>
                <Link
                  href={withDemoQuery("/submissions", navDemo)}
                  className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight text-stone-900 transition-all duration-300 ease-out hover:bg-stone-100/90 hover:text-stone-950"
                >
                  Submissions
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {usagePill}
              <SignOutButton />
            </div>
          </div>
          <nav className="flex flex-wrap gap-1 border-t border-stone-200/60 px-5 py-3 sm:hidden">
            <Link
              href={withDemoQuery("/dashboard", navDemo)}
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950"
            >
              Properties
            </Link>
            <Link
              href={withDemoQuery("/properties/new", navDemo)}
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950"
            >
              Add property
            </Link>
            <Link
              href={
                navDemo
                  ? requestFullAccessHref({
                      nextPath: withDemoQuery("/dashboard", true),
                      sourceRoute: withDemoQuery("/dashboard", true),
                    })
                  : "/pricing"
              }
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950"
            >
              {navDemo ? "Request Full Access" : "Pricing"}
            </Link>
            <Link
              href={withDemoQuery("/profile", navDemo)}
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950"
            >
              Profile
            </Link>
            <Link
              href={withDemoQuery("/submissions", navDemo)}
              className="rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-stone-900 transition-all duration-300 ease-out hover:bg-stone-50 hover:text-stone-950"
            >
              Submissions
            </Link>
          </nav>
        </header>
        <PlanGateDebugRibbon isProPreview={navDemo} />
        <ProPreviewChrome />
        <main className="mx-auto max-w-6xl bg-transparent px-6 py-12 sm:px-10 sm:py-16 lg:px-12 lg:py-20">
          {children}
        </main>
      </div>
    </DashboardAtmosphere>
  );
}
