import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getPlanAccess } from "@/lib/plan-access";

const PRO_PREVIEW_NAV_COOKIE = "aervara_pro_preview";

type PlanGateDebugRibbonProps = {
  /**
   * When true, matches `getPlanAccess(..., { isProPreview: true })` for pages
   * driven by `?demo=true` (outside the dashboard nav cookie).
   */
  isProPreview?: boolean;
};

/** Development-only: shows merged gate flags at top of shell / standalone pages. */
export async function PlanGateDebugRibbon({
  isProPreview: isProPreviewProp = false,
}: PlanGateDebugRibbonProps = {}) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_AERVARA_SHOW_GATE_DEBUG !== "true"
  ) {
    return null;
  }

  const cookieStore = await cookies();
  const navDemo = cookieStore.get(PRO_PREVIEW_NAV_COOKIE)?.value === "1";
  const isProPreview = isProPreviewProp || navDemo;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const plan = await getPlanAccess(supabase, user.id, user.email, {
    isProPreview,
  });
  const d = plan.gateDebug;
  if (!d) return null;

  return (
    <div className="border-b border-violet-400/40 bg-violet-950 px-4 py-2 font-mono text-[10px] leading-relaxed text-violet-100">
      <span className="font-semibold tracking-wide text-violet-200">Plan gate (dev)</span>
      <span className="mx-2 text-violet-400">|</span>
      <span>isAdmin={String(d.isAdmin)}</span>
      <span className="mx-2 text-violet-400">|</span>
      <span>hasProAccess={String(d.hasProAccess)}</span>
      <span className="mx-2 text-violet-400">|</span>
      <span>hasEliteAccess={String(d.hasEliteAccess)}</span>
      <span className="mx-2 text-violet-400">|</span>
      <span>membership_tier={JSON.stringify(d.membership_tier)}</span>
      <span className="mx-2 text-violet-400">|</span>
      <span>role={JSON.stringify(d.role)}</span>
      {plan.isProPreview ? (
        <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-100">
          proPreview
        </span>
      ) : null}
    </div>
  );
}
