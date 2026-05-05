import Link from "next/link";
import { PropertyForm } from "@/components/properties/property-form";
import { Button } from "@/components/ui/button";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { isDemoMode } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { getPlanAccess } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";

type NewPropertyPageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function NewPropertyPage({ searchParams }: NewPropertyPageProps) {
  const q = await searchParams;
  const isDemo = isDemoMode(q.demo);
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

  const readOnly = isDemo;
  const showBuildingForm =
    isDemo ||
    plan?.isPlatformAdmin === true ||
    plan?.canAddMoreProperties === true;

  const showPropertyLimitGate =
    !isDemo &&
    plan != null &&
    !plan.isPlatformAdmin &&
    !plan.canAddMoreProperties;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={withDemoQuery("/dashboard", isDemo)}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
          Add Building / Data Input
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Submit a building record. We auto-calculate envelope potential and mark
          it for verification.
        </p>
      </div>

      {isDemo ? (
        <p className="rounded-xl border border-sky-200/80 bg-sky-50/90 px-4 py-3 text-sm text-sky-950">
          Demo preview — building submissions are available with full access.
        </p>
      ) : null}

      {showPropertyLimitGate ? (
        <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-b from-stone-50/95 to-white px-6 py-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03]">
          <p className="text-sm font-medium leading-relaxed text-neutral-800">
            You have reached the property limit on your current plan. Request full
            access to add more buildings and unlock bulk tools.
          </p>
          <div className="mt-5">
            <Button asChild className="rounded-xl">
              <RequestFullAccessLink returnToPath={withDemoQuery("/properties/new", isDemo)}>
                Request Full Access
              </RequestFullAccessLink>
            </Button>
          </div>
        </div>
      ) : null}

      {showBuildingForm ? (
        <PropertyForm
          readOnly={readOnly}
          demoPreview={isDemo}
          cancelHref={withDemoQuery("/dashboard", isDemo)}
        />
      ) : null}
    </div>
  );
}
