"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, formatSqft } from "@/lib/far-calculations";
import {
  computeDevelopmentAnalysis,
  computeProfitMarginOnCostPercent,
  DEFAULT_SOFT_COST_PCT,
} from "@/lib/development-analysis";
import { cn } from "@/lib/utils";

function parseOptionalRate(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function strInit(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(Number(n))) return "";
  return String(n);
}

type QuickDealCalculatorProps = {
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  estimatedValuePerBuildableSqft: number | null;
  initialConstructionCostPerSqft: number | null;
  initialExitValuePerSqft: number | null;
  initialSoftCostPercentage: number;
  unusedBuildableSqft: number;
};

export function QuickDealCalculator({
  lotSizeSqft,
  builtFloorAreaSqft,
  maxFar,
  estimatedValuePerBuildableSqft,
  initialConstructionCostPerSqft,
  initialExitValuePerSqft,
  initialSoftCostPercentage,
  unusedBuildableSqft,
}: QuickDealCalculatorProps) {
  const [constructionStr, setConstructionStr] = useState(() =>
    strInit(initialConstructionCostPerSqft),
  );
  const [exitStr, setExitStr] = useState(() => strInit(initialExitValuePerSqft));
  const [softStr, setSoftStr] = useState(() =>
    String(
      Number.isFinite(initialSoftCostPercentage)
        ? initialSoftCostPercentage
        : DEFAULT_SOFT_COST_PCT,
    ),
  );

  const result = useMemo(() => {
    const cons = parseOptionalRate(constructionStr);
    const exit = parseOptionalRate(exitStr);
    const softRaw = softStr.trim();
    const softNum = softRaw === "" ? DEFAULT_SOFT_COST_PCT : Number(softRaw);
    const softCostPct =
      Number.isFinite(softNum) && softNum >= 0
        ? Math.min(100, softNum)
        : DEFAULT_SOFT_COST_PCT;

    return computeDevelopmentAnalysis({
      lotSizeSqft,
      builtFloorAreaSqft,
      maxFar,
      estimatedValuePerBuildableSqft,
      constructionCostPerSqft: cons,
      softCostPercentage: softCostPct,
      exitValuePerSqft: exit,
    });
  }, [
    lotSizeSqft,
    builtFloorAreaSqft,
    maxFar,
    estimatedValuePerBuildableSqft,
    constructionStr,
    exitStr,
    softStr,
  ]);

  const marginPct = computeProfitMarginOnCostPercent(
    result.estimated_profit,
    result.total_cost,
  );

  return (
    <div
      className={cn(
        "mt-10 max-w-3xl rounded-2xl border border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/40 p-7",
        "shadow-[0_16px_40px_-24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.03)] ring-1 ring-neutral-950/[0.035] md:p-8",
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Quick deal calculator
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Live pro forma on{" "}
            <span className="font-mono tabular-nums text-neutral-700">
              {formatSqft(unusedBuildableSqft)}
            </span>{" "}
            unused buildable sq ft. Exit falls back to est. value / sf if left
            blank.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="qdc-construction" className="text-xs text-neutral-500">
            Construction cost / sq ft
          </Label>
          <Input
            id="qdc-construction"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="e.g. 285"
            value={constructionStr}
            onChange={(e) => setConstructionStr(e.target.value)}
            className="font-mono text-sm tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qdc-exit" className="text-xs text-neutral-500">
            Exit value / sq ft
          </Label>
          <Input
            id="qdc-exit"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="Optional"
            value={exitStr}
            onChange={(e) => setExitStr(e.target.value)}
            className="font-mono text-sm tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qdc-soft" className="text-xs text-neutral-500">
            Soft cost (%)
          </Label>
          <Input
            id="qdc-soft"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.5"
            placeholder={String(DEFAULT_SOFT_COST_PCT)}
            value={softStr}
            onChange={(e) => setSoftStr(e.target.value)}
            className="font-mono text-sm tabular-nums"
          />
        </div>
      </div>

      <div
        className="mt-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent"
        aria-hidden
      />
      <dl
        className="mt-6 grid gap-0 sm:grid-cols-2 sm:gap-x-10"
        aria-live="polite"
      >
        <CalcRow
          label="Total development cost"
          value={formatMoney(result.total_cost)}
        />
        <CalcRow
          label="Total project value"
          value={formatMoney(result.project_value)}
        />
        <CalcRow
          label="Estimated profit"
          value={formatMoney(result.estimated_profit)}
          emphasize
        />
        <CalcRow
          label="Profit margin"
          value={marginPct != null ? `${marginPct.toFixed(1)}%` : "—"}
          hint="Yield on total development cost"
        />
      </dl>
    </div>
  );
}

function CalcRow({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div className="border-b border-neutral-100/45 py-3.5 last:border-b-0 sm:border-0 sm:py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 font-mono font-semibold tabular-nums text-neutral-950",
          emphasize ? "text-lg tracking-tight sm:text-xl" : "text-sm",
        )}
      >
        {value}
      </dd>
      {hint ? (
        <p className="mt-1 text-[10px] leading-snug text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}
