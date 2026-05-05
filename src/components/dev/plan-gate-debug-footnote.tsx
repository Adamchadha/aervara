import type { PlanGateDebug } from "@/lib/plan-access";

/** Renders under gated / upsell surfaces in non-production builds. */
export function PlanGateDebugFootnote({
  d,
}: {
  d: PlanGateDebug | null | undefined;
}) {
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_AERVARA_SHOW_GATE_DEBUG !== "true" ||
    !d
  ) {
    return null;
  }
  return (
    <p className="mt-3 text-left font-mono text-[9px] leading-relaxed text-violet-700/90">
      [gate debug] isAdmin={String(d.isAdmin)} · hasProAccess={String(d.hasProAccess)} ·
      hasEliteAccess={String(d.hasEliteAccess)} · membership_tier=
      {JSON.stringify(d.membership_tier)} · role={JSON.stringify(d.role)}
    </p>
  );
}
