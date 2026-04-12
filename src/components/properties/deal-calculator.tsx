"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney, formatSqft } from "@/lib/far-calculations";
import {
  computeFullBuildableDeal,
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

type DealCalculatorProps = {
  lotSizeSqft: number;
  maxFar: number;
  initialConstructionCostPerSqft: number | null;
  initialSoftCostPercentage: number;
  /** Pre-fill exit $/sf from estimated value per buildable sq ft. */
  initialExitValuePerSqftFromEstimate: number | null;
};

export function DealCalculator({
  lotSizeSqft,
  maxFar,
  initialConstructionCostPerSqft,
  initialSoftCostPercentage,
  initialExitValuePerSqftFromEstimate,
}: DealCalculatorProps) {
  const [constructionStr, setConstructionStr] = useState(() =>
    strInit(initialConstructionCostPerSqft),
  );
  const [softStr, setSoftStr] = useState(() =>
    String(
      Number.isFinite(initialSoftCostPercentage)
        ? initialSoftCostPercentage
        : DEFAULT_SOFT_COST_PCT,
    ),
  );
  const [exitStr, setExitStr] = useState(() =>
    strInit(initialExitValuePerSqftFromEstimate),
  );

  const model = useMemo(() => {
    const cons = parseOptionalRate(constructionStr);
    const exit = parseOptionalRate(exitStr);
    const softRaw = softStr.trim();
    const softNum = softRaw === "" ? DEFAULT_SOFT_COST_PCT : Number(softRaw);
    const softPct =
      Number.isFinite(softNum) && softNum >= 0
        ? Math.min(100, softNum)
        : DEFAULT_SOFT_COST_PCT;

    return computeFullBuildableDeal({
      lotSizeSqft,
      maxFar,
      constructionCostPerSqft: cons,
      softCostPercentage: softPct,
      exitValuePerSqft: exit,
    });
  }, [lotSizeSqft, maxFar, constructionStr, softStr, exitStr]);

  const marginStr =
    model.profit_margin_on_project_value != null
      ? `${model.profit_margin_on_project_value.toFixed(1)}%`
      : "—";

  return (
    <div
      className={cn(
        "mt-10 max-w-3xl rounded-2xl border border-neutral-200/50 bg-gradient-to-b from-white to-neutral-50/40 p-7",
        "shadow-[0_16px_40px_-24px_rgba(15,23,42,0.08),0_2px_6px_rgba(15,23,42,0.03)] ring-1 ring-neutral-950/[0.035] md:p-8",
      )}
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        Deal calculator
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-500">
        Full as-of-right envelope (lot × max FAR). Soft cost is a percent of
        hard construction.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="deal-construction" className="text-xs text-neutral-500">
            Construction cost / sq ft
          </Label>
          <Input
            id="deal-construction"
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
          <Label htmlFor="deal-soft" className="text-xs text-neutral-500">
            Soft cost (%)
          </Label>
          <Input
            id="deal-soft"
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
        <div className="space-y-2">
          <Label htmlFor="deal-exit" className="text-xs text-neutral-500">
            Exit value / sq ft
          </Label>
          <Input
            id="deal-exit"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="From estimate or enter"
            value={exitStr}
            onChange={(e) => setExitStr(e.target.value)}
            className="font-mono text-sm tabular-nums"
          />
        </div>
      </div>

      <div
        className="mt-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent"
        aria-hidden
      />

      <dl className="mt-6 max-w-xl space-y-0 divide-y divide-neutral-100/50" aria-live="polite">
        <OutRow
          label="Total buildable area"
          value={formatSqft(model.total_buildable_sqft)}
        />
        <OutRow
          label="Total development cost"
          value={formatMoney(model.total_development_cost)}
        />
        <OutRow
          label="Total project value"
          value={formatMoney(model.total_project_value)}
        />
        <OutRow
          label="Estimated profit"
          value={formatMoney(model.estimated_profit)}
          bold
        />
        <OutRow
          label="Profit margin"
          value={marginStr}
          hint="Profit ÷ project value"
          bold
        />
      </dl>
    </div>
  );
}

function OutRow({
  label,
  value,
  hint,
  bold,
}: {
  label: string;
  value: string;
  hint?: string;
  bold?: boolean;
}) {
  return (
    <div className="py-4 first:pt-1">
      <div className="flex items-baseline justify-between gap-6">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          {label}
        </dt>
        <dd
          className={cn(
            "text-right font-mono tabular-nums text-neutral-950",
            bold
              ? "text-lg font-bold tracking-tight sm:text-xl"
              : "text-sm font-semibold",
          )}
        >
          {value}
        </dd>
      </div>
      {hint ? (
        <p className="mt-1 text-right text-[10px] leading-snug text-neutral-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
