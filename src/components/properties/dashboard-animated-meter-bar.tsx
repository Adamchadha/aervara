"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function clampPct(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

type AnimatedMeterBarProps = {
  targetPercent: number;
  tone?: "emerald" | "neutral";
  /** Track + fill height (Tailwind h-*). */
  heightClassName?: string;
  trackClassName?: string;
  durationMs?: number;
};

/**
 * Horizontal meter that fills from 0 → target on mount (institutional, subtle).
 */
export function AnimatedMeterBar({
  targetPercent,
  tone = "emerald",
  heightClassName = "h-2.5",
  trackClassName,
  durationMs = 950,
}: AnimatedMeterBarProps) {
  const reduced = usePrefersReducedMotion();
  const target = clampPct(targetPercent);
  const [width, setWidth] = useState(() => (reduced ? target : 0));

  useEffect(() => {
    if (reduced) {
      setWidth(target);
      return;
    }
    const id = window.requestAnimationFrame(() => setWidth(target));
    return () => window.cancelAnimationFrame(id);
  }, [target, reduced]);

  const fill =
    tone === "emerald"
      ? "bg-emerald-500"
      : "bg-neutral-800";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-stone-200/55",
        heightClassName,
        trackClassName,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full will-change-[width]",
          fill,
          reduced ? "" : "transition-[width] ease-out motion-reduce:transition-none",
        )}
        style={{
          width: `${width}%`,
          transitionDuration: reduced ? "0ms" : `${durationMs}ms`,
        }}
      />
    </div>
  );
}

type DealSnapshotScoreBarProps = {
  score: number;
  label: string;
};

/** Deal snapshot row: label + animated score meter + priority label. */
export function DealSnapshotScoreBar({ score, label }: DealSnapshotScoreBarProps) {
  const pct = clampPct(score);
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-neutral-400">
          Opportunity score
        </p>
        <p className="text-sm font-bold tabular-nums tracking-tight text-neutral-900">
          {Math.round(score)}
        </p>
      </div>
      <AnimatedMeterBar targetPercent={pct} tone="emerald" durationMs={1000} />
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
