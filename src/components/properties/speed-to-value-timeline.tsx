import type { SpeedToValueTimeline } from "@/lib/deal-decision";

type SpeedToValueTimelineProps = {
  timeline: SpeedToValueTimeline;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-stone-100/80 py-3 last:border-b-0">
      <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
        {label}
      </dt>
      <dd className="font-mono text-sm font-medium tabular-nums text-neutral-900">
        {value} months
      </dd>
    </div>
  );
}

export function SpeedToValueTimeline({ timeline }: SpeedToValueTimelineProps) {
  return (
    <div className="max-w-2xl rounded-2xl border border-stone-200/70 bg-gradient-to-b from-stone-50/70 to-white px-6 py-6 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset] ring-1 ring-stone-900/[0.02]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
        Directional screening timeline
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-neutral-950">
        {timeline.stabilizationLabel}
      </h3>
      <dl className="mt-5">
        <Row label="Entitlement / zoning review" value={timeline.entitlementMonths} />
        <Row label="Design + approvals" value={timeline.designApprovalMonths} />
        <Row label="Construction" value={timeline.constructionMonths} />
        <Row label="Stabilization" value={timeline.stabilizationMonths} />
        <Row label="Total rough timeline" value={timeline.totalMonths} />
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-neutral-500">
        Directional estimate for screening only. Actual duration depends on entitlement path,
        consultant workflow, procurement timing, and lease-up conditions.
      </p>
    </div>
  );
}
