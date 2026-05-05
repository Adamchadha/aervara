"use client";

import { PlanGateDebugFootnote } from "@/components/dev/plan-gate-debug-footnote";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { Button } from "@/components/ui/button";
import type { PlanGateDebug } from "@/lib/plan-access";
import { cn } from "@/lib/utils";

type ProFeaturePlaceholderProps = {
  title: string;
  description: string;
  className?: string;
  /** Dev-only: merged gate snapshot for this surface (from `getPlanAccess`). */
  gateDebug?: PlanGateDebug | null;
};

export function ProFeaturePlaceholder({
  title,
  description,
  className,
  gateDebug,
}: ProFeaturePlaceholderProps) {
  const ctaLabel = "Request Full Access";
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-dashed border-stone-200/80 bg-gradient-to-b from-stone-50/60 to-white/80 px-8 py-12 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-stone-900/[0.025]",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
        Access is limited
      </p>
      <h3 className="mt-3 text-lg font-semibold tracking-tight text-neutral-950">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <RequestFullAccessLink>{ctaLabel}</RequestFullAccessLink>
        </Button>
      </div>
      <PlanGateDebugFootnote d={gateDebug} />
    </div>
  );
}
