"use client";

import Link from "next/link";
import { usePublicDemoWorkspace } from "@/components/demo/public-demo-workspace";
import {
  AnimatedMeterBar,
  DealSnapshotScoreBar,
} from "@/components/properties/dashboard-animated-meter-bar";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import { propertyDetailHref } from "@/lib/demo-query";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

type DealSnapshotCardProps = {
  property: PropertyRow;
  impliedUpside: number;
  unusedBuildableSqft: number;
  builtFar: number;
  maxFar: number;
  score: number;
  priorityLabel: string;
  isDemo?: boolean;
  publicDemo?: boolean;
};

/** Investment memo–style snapshot; softer than hero, same system. */
export function DealSnapshotCard({
  property: p,
  impliedUpside,
  unusedBuildableSqft,
  builtFar,
  maxFar,
  score,
  priorityLabel,
  isDemo = false,
  publicDemo = false,
}: DealSnapshotCardProps) {
  const inPublicDemoWorkspace = usePublicDemoWorkspace();
  const farPct = maxFar > 0 ? clampPct((builtFar / maxFar) * 100) : 0;
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl border border-stone-300/45 bg-gradient-to-b from-white/90 to-stone-50/70 px-5 py-5 sm:px-5.5 sm:py-5.5",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_14px_40px_-28px_rgba(15,23,42,0.14)]",
        "ring-1 ring-stone-900/[0.035]",
        "transition-[transform,box-shadow,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:bg-white hover:shadow-[0_22px_52px_-30px_rgba(15,23,42,0.18)]",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="-mx-5 -mt-5 mb-4 h-1 rounded-t-xl bg-gradient-to-r from-slate-900/80 via-slate-700/45 to-transparent sm:-mx-5.5" />
      <p className="line-clamp-2 text-[0.9rem] font-semibold leading-snug tracking-tight text-neutral-950">
        {p.address}
      </p>
      <p className="mt-1.5 text-xs font-medium text-neutral-500">
        {p.city}, {p.state}
      </p>
      <div className="mt-4">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-neutral-400">
          Implied upside
        </p>
        <p className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.04em] text-neutral-950 sm:text-[1.75rem]">
          {formatMoney(impliedUpside)}
        </p>
      </div>
      <div className="mt-4">
        <DealSnapshotScoreBar score={score} label={priorityLabel} />
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        <span className="text-neutral-400">Unused buildable</span>{" "}
        <span className="font-semibold tabular-nums text-neutral-800">
          {formatSqft(unusedBuildableSqft)} sq ft
        </span>
      </p>
      <div className="mt-3 space-y-1">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-neutral-400">
          FAR utilization
        </p>
        <AnimatedMeterBar
          targetPercent={farPct}
          tone="neutral"
          heightClassName="h-1.5"
          durationMs={900}
        />
        <p className="text-[0.7rem] tabular-nums text-neutral-500">
          Built {formatFar(builtFar)} / max {formatFar(maxFar)}
        </p>
      </div>
      <div className="mt-3.5">
        <Link
          href={propertyDetailHref(p.id, {
            isDemo,
            publicDemo: publicDemo || inPublicDemoWorkspace,
          })}
          className="inline-flex rounded-md border border-emerald-200/65 bg-emerald-50/45 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700 transition-colors hover:bg-emerald-50/75"
        >
          Open deal
        </Link>
      </div>
    </article>
  );
}
