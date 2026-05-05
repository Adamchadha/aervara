"use client";

import { cn } from "@/lib/utils";

type FarVerticalCapacityBarProps = {
  builtFar: number;
  maxFar: number;
  className?: string;
};

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function FarVerticalCapacityBar({
  builtFar,
  maxFar,
  className,
}: FarVerticalCapacityBarProps) {
  const max = Number.isFinite(maxFar) && maxFar > 0 ? maxFar : 0;
  const built = Number.isFinite(builtFar) ? Math.max(0, builtFar) : 0;
  const builtRatio = max > 0 ? clamp01(built / max) : 0;
  const unusedRatio = clamp01(1 - builtRatio);

  return (
    <div className={cn("flex items-end gap-4", className)}>
      <div className="relative h-40 w-10 overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-50/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-950 via-neutral-900 to-neutral-700 transition-[height] duration-500"
          style={{ height: `${builtRatio * 100}%` }}
          aria-hidden
        />
      </div>
      <div className="space-y-2 text-[11px]">
        <div>
          <p className="font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Built
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
            {built.toFixed(2)} FAR
          </p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Unused vertical capacity
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-neutral-900">
            {(max - built > 0 ? max - built : 0).toFixed(2)} FAR
          </p>
        </div>
        <p className="text-neutral-500">
          {Math.round(unusedRatio * 100)}% of the envelope remains unbuilt.
        </p>
      </div>
    </div>
  );
}
