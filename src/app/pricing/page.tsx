import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { isDemoMode, requestFullAccessHref } from "@/lib/demo-flow";
import { FREE_TIER_MAX_PROPERTIES } from "@/lib/plan-access";
import {
  STRIPE_CHECKOUT_DISABLED_MESSAGE,
  stripeCheckoutAvailable,
  stripePaidPlansFullyConfigured,
} from "@/lib/stripe-config";
import { PlanGateDebugRibbon } from "@/components/dev/plan-gate-debug-ribbon";
import { getPlanAccess } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Aervara Free, Pro, and Elite plans for opportunity analysis and deal rooms.",
};

type PricingPageProps = {
  searchParams: Promise<{ demo?: string }>;
};

function PlanCard({
  id,
  name,
  price,
  description,
  features,
  highlighted,
  cta,
}: {
  id?: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "aervara-landing-card flex scroll-mt-28 flex-col rounded-[1.35rem] border p-8 ring-1",
        highlighted
          ? "border-stone-300/80 ring-stone-900/[0.06] shadow-[0_20px_56px_-28px_rgba(15,23,42,0.12)]"
          : "border-stone-200/60 ring-stone-900/[0.025]",
      )}
    >
      <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
        {name}
      </h2>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950">
        {price}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
      <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-neutral-700">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-0.5 text-neutral-400" aria-hidden>
              ✓
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10">{cta}</div>
    </div>
  );
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const sp = await searchParams;
  const isDemo = isDemoMode(sp.demo);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan =
    user != null
      ? await getPlanAccess(supabase, user.id, user.email, {
          isProPreview: isDemo,
        })
      : null;

  const proCheckout = stripeCheckoutAvailable("pro");
  const eliteCheckout = stripeCheckoutAvailable("elite");
  const stripeReady = stripePaidPlansFullyConfigured();
  const showStripeNotice =
    !isDemo && !stripeReady && !plan?.isPlatformAdmin;

  const dashboardDemoHref = "/dashboard?demo=true";
  const loginDemoHref = `/login?redirect=${encodeURIComponent(dashboardDemoHref)}`;
  const applyAfterDemoHref = requestFullAccessHref({
    nextPath: dashboardDemoHref,
    sourceRoute: isDemo ? "/pricing?demo=true" : "/pricing",
  });

  return (
    <div className="min-h-full bg-gradient-to-b from-stone-100/40 via-[var(--background)] to-stone-50/30">
      <SiteHeader
        demoAccess={isDemo}
        accessRequestHref={isDemo ? applyAfterDemoHref : undefined}
      />
      <PlanGateDebugRibbon isProPreview={isDemo} />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          {isDemo ? "Access" : "Membership"}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-[2.15rem] sm:leading-[1.15]">
          {isDemo ? "Access levels within Aervara" : "Plans built for real deal flow"}
        </h1>
        <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base">
          {isDemo ? (
            <>
              Aervara is available to a limited group of operators, developers, and capital
              partners. Access is granted based on fit.
            </>
          ) : (
            <>
              Start free, move to Pro for full Site Rooms and deal tooling, or Elite for
              verified positioning and priority inventory. Billing runs on Stripe when
              enabled.
            </>
          )}
        </p>

        {isDemo ? (
          <div className="mt-10 rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white to-stone-50/80 p-6 shadow-[0_16px_48px_-28px_rgba(120,53,15,0.12)] ring-1 ring-amber-900/[0.06] sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-900/70">
              Preview
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
              Read-only preview
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600">
              Explore the product with demo routing and sample surfaces. When you are ready
              to work live deals in Aervara, request full access through the application
              flow.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="rounded-xl sm:min-w-[14rem]">
                <Link href={user ? dashboardDemoHref : loginDemoHref}>
                  Continue to demo dashboard
                </Link>
              </Button>
              <Button variant="secondary" asChild className="rounded-xl sm:min-w-[14rem]">
                <Link href={applyAfterDemoHref}>Request Full Access</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {isDemo ? (
          <div className="mt-10 max-w-3xl rounded-2xl border border-stone-200/70 bg-white/80 px-5 py-4 text-sm leading-relaxed text-neutral-600 shadow-sm ring-1 ring-stone-900/[0.03] sm:px-6 sm:py-5">
            Access is intentionally limited to maintain high-quality deal flow and
            serious counterparties.
          </div>
        ) : null}

        {showStripeNotice ? (
          <div
            className="mt-10 rounded-2xl border border-stone-200/70 bg-white/90 px-5 py-4 text-sm leading-relaxed text-neutral-600 shadow-sm ring-1 ring-stone-900/[0.04] sm:px-6"
            role="status"
          >
            <p className="font-medium text-neutral-800">
              {STRIPE_CHECKOUT_DISABLED_MESSAGE}
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Set{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">
                STRIPE_SECRET_KEY
              </code>
              ,{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">
                STRIPE_PRICE_PRO_MONTHLY
              </code>
              , and{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-[11px]">
                STRIPE_PRICE_ELITE_MONTHLY
              </code>{" "}
              to enable paid plans in this environment.
            </p>
          </div>
        ) : null}

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <PlanCard
            name={isDemo ? "Preview access" : "Free"}
            price={isDemo ? "Screen first" : "$0"}
            description={
              isDemo
                ? `Screen up to ${FREE_TIER_MAX_PROPERTIES} parcels with core FAR reads, scores, and essentials—before you apply for a workspace.`
                : `Screen up to ${FREE_TIER_MAX_PROPERTIES} properties with core FAR, scores, and essentials.`
            }
            features={
              isDemo
                ? [
                    `Up to ${FREE_TIER_MAX_PROPERTIES} parcels in preview`,
                    "Air rights value & underbuilt score",
                    "Dashboard & map views",
                    "Site visit planning",
                  ]
                : [
                    `Up to ${FREE_TIER_MAX_PROPERTIES} properties`,
                    "Air rights value & underbuilt score",
                    "Dashboard & map views",
                    "Site visit planning",
                  ]
            }
            cta={
              isDemo ? (
                <Button variant="secondary" asChild className="w-full rounded-xl sm:w-auto">
                  <Link href={applyAfterDemoHref}>Request Full Access</Link>
                </Button>
              ) : user ? (
                <Button variant="secondary" asChild className="w-full rounded-xl sm:w-auto">
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <Button variant="secondary" asChild className="w-full rounded-xl sm:w-auto">
                  <Link href="/login?redirect=/pricing">Sign in</Link>
                </Button>
              )
            }
          />
          <PlanCard
            id="plan-pro"
            name={isDemo ? "Full access" : "Pro"}
            price={isDemo ? "Workspace" : "$29/mo"}
            description={
              isDemo
                ? "Structured Site Rooms, CSV import, exports, and advanced analysis across every parcel you work once admitted."
                : "Full deal rooms, CSV import, exports, and advanced analysis on every parcel you own."
            }
            highlighted
            features={
              isDemo
                ? [
                    "Unlimited parcels in your workspace",
                    "Site Room: actions, concierge, invites, activity",
                    "CSV import & deal report PDF",
                    "Scenarios, calculators, memos & confidence reads",
                  ]
                : [
                    "Unlimited properties",
                    "Deal Room: actions, concierge, invites, activity",
                    "CSV import & deal report PDF",
                    "Scenarios, calculators, memos & confidence reads",
                  ]
            }
            cta={
              isDemo ? (
                <Button asChild className="w-full rounded-xl sm:w-auto">
                  <Link href={applyAfterDemoHref}>Request Full Access</Link>
                </Button>
              ) : user ? (
                plan?.hasProAccess ? (
                  <p className="text-xs leading-relaxed text-neutral-600">
                    Pro is already included for your account (including platform
                    admins). Open the dashboard to continue, or use Profile → Manage
                    billing if you pay through Stripe.
                  </p>
                ) : (
                  <CheckoutButton
                    plan="pro"
                    label="Continue with Pro"
                    checkoutEnabled={proCheckout}
                    className="w-full sm:w-auto"
                  />
                )
              ) : (
                <Button asChild className="w-full rounded-xl sm:w-auto">
                  <Link href="/login?redirect=/pricing">Sign in to continue</Link>
                </Button>
              )
            }
          />
          <PlanCard
            name={isDemo ? "Priority access" : "Elite"}
            price={isDemo ? "Verified cohort" : "$99/mo"}
            description={
              isDemo
                ? "Everything in full access, plus verified positioning and priority-ranked opportunities for serious counterparties."
                : "Everything in Pro plus verified positioning and access to premium, priority-ranked opportunities."
            }
            features={
              isDemo
                ? [
                    "Everything in full access",
                    "Verification signal (in-product)",
                    "Priority-ranked opportunity inventory",
                    "Preferred placement in opportunity feeds",
                  ]
                : [
                    "Everything in Pro",
                    "Elite verification badge (in-product)",
                    "Premium property inventory",
                    "Priority placement in opportunity feeds",
                  ]
            }
            cta={
              isDemo ? (
                <Button variant="secondary" asChild className="w-full rounded-xl sm:w-auto">
                  <Link href={applyAfterDemoHref}>Request Full Access</Link>
                </Button>
              ) : user ? (
                plan?.hasEliteAccess ? (
                  <p className="text-xs leading-relaxed text-neutral-600">
                    Elite is already included for your account (including platform
                    admins). Use Profile → Manage billing if you bill through Stripe.
                  </p>
                ) : (
                  <CheckoutButton
                    plan="elite"
                    label="Continue with Elite"
                    variant="secondary"
                    checkoutEnabled={eliteCheckout}
                    className="w-full sm:w-auto"
                  />
                )
              ) : (
                <Button variant="secondary" asChild className="w-full rounded-xl sm:w-auto">
                  <Link href="/login?redirect=/pricing">Sign in to continue</Link>
                </Button>
              )
            }
          />
        </div>

        <p className="mt-14 text-center text-xs leading-relaxed text-neutral-400">
          {isDemo
            ? "Access is limited in this preview until you are approved."
            : stripeReady
              ? "Secure checkout via Stripe. Manage billing anytime from your profile."
              : "Paid checkout appears here once Stripe is configured for this deployment."}
        </p>
      </main>
    </div>
  );
}
