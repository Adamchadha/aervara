"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  computeDevelopmentAnalysis,
  computeProfitMarginOnCostPercent,
} from "@/lib/development-analysis";
import { formatMoney, formatMoneyUsd, formatSqft } from "@/lib/far-calculations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
import { cn } from "@/lib/utils";

export type ScenarioKey = "conservative" | "base" | "aggressive";

type ScenarioInputs = {
  maxFar: string;
  exitPerBuildableSqft: string;
  constructionPerSqft: string;
  softCostPct: string;
};

type ScenarioModePanelProps = {
  lotSqft: number;
  builtSqft: number;
  propertyMaxFar: number;
  estimatedValuePerSqft: number | null;
  propertyExitPerSqft: number | null;
  propertyConstructionPerSqft: number | null;
  propertySoftCostPct: number;
};

function parseFlexibleNumber(raw: string): number | null {
  const t = raw.trim().replace(/,/g, "").replace(/[$€£]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function fmtFar(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return n.toFixed(2);
}

function exitScaled(exitBase: number | null, factor: number): string {
  if (exitBase != null && exitBase > 0) {
    return String(Math.round(exitBase * factor * 100) / 100);
  }
  return "";
}

function buildInitialScenarios(args: {
  maxFar: number;
  exit: number | null;
  cons: number | null;
  soft: number;
}): Record<ScenarioKey, ScenarioInputs> {
  const { maxFar, exit, cons, soft } = args;
  const consStr =
    cons != null && cons > 0 ? String(Math.round(cons * 100) / 100) : "";
  const softStr = String(Math.round(soft * 10) / 10);

  return {
    conservative: {
      maxFar: fmtFar(Math.max(0.01, maxFar * 0.88)),
      exitPerBuildableSqft: exitScaled(exit, 0.9),
      constructionPerSqft:
        cons != null && cons > 0
          ? String(Math.round(cons * 1.12 * 100) / 100)
          : "",
      softCostPct: String(Math.min(100, Math.round((soft + 8) * 10) / 10)),
    },
    base: {
      maxFar: fmtFar(maxFar),
      exitPerBuildableSqft: exitScaled(exit, 1),
      constructionPerSqft: consStr,
      softCostPct: softStr,
    },
    aggressive: {
      maxFar: fmtFar(maxFar),
      exitPerBuildableSqft: exitScaled(exit, 1.1),
      constructionPerSqft:
        cons != null && cons > 0
          ? String(Math.round(cons * 0.92 * 100) / 100)
          : "",
      softCostPct: String(Math.max(0, Math.round((soft - 5) * 10) / 10)),
    },
  };
}

export function ScenarioModePanel({
  lotSqft,
  builtSqft,
  propertyMaxFar,
  estimatedValuePerSqft,
  propertyExitPerSqft,
  propertyConstructionPerSqft,
  propertySoftCostPct,
}: ScenarioModePanelProps) {
  const baselineExit =
    propertyExitPerSqft != null &&
    Number.isFinite(propertyExitPerSqft) &&
    propertyExitPerSqft > 0
      ? propertyExitPerSqft
      : estimatedValuePerSqft != null &&
          Number.isFinite(estimatedValuePerSqft) &&
          estimatedValuePerSqft > 0
        ? estimatedValuePerSqft
        : null;

  const baselineCons =
    propertyConstructionPerSqft != null &&
    Number.isFinite(propertyConstructionPerSqft) &&
    propertyConstructionPerSqft > 0
      ? propertyConstructionPerSqft
      : null;

  const [active, setActive] = useState<ScenarioKey>("base");
  const [scenarios, setScenarios] = useState<Record<ScenarioKey, ScenarioInputs>>(
    () =>
      buildInitialScenarios({
        maxFar: propertyMaxFar,
        exit: baselineExit,
        cons: baselineCons,
        soft: propertySoftCostPct,
      }),
  );

  const updateScenario = useCallback(
    (key: ScenarioKey, patch: Partial<ScenarioInputs>) => {
      setScenarios((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    },
    [],
  );

  const results = useMemo(() => {
    const keys: ScenarioKey[] = ["conservative", "base", "aggressive"];
    return keys.map((key) => {
      const s = scenarios[key]!;
      const maxFar = parseFlexibleNumber(s.maxFar);
      const exit = parseFlexibleNumber(s.exitPerBuildableSqft);
      const cons = parseFlexibleNumber(s.constructionPerSqft);
      const soft = parseFlexibleNumber(s.softCostPct);

      if (maxFar == null || maxFar <= 0) {
        return { key, ok: false as const };
      }

      const dev = computeDevelopmentAnalysis({
        lotSizeSqft: lotSqft,
        builtFloorAreaSqft: builtSqft,
        maxFar,
        estimatedValuePerBuildableSqft: estimatedValuePerSqft,
        constructionCostPerSqft: cons,
        softCostPercentage: soft,
        exitValuePerSqft: exit,
      });

      const margin = computeProfitMarginOnCostPercent(
        dev.estimated_profit,
        dev.total_cost,
      );

      return {
        key,
        ok: true as const,
        dev,
        marginPct: margin,
      };
    });
  }, [lotSqft, builtSqft, estimatedValuePerSqft, scenarios]);

  const activeInputs = scenarios[active];

  const scenarioLabel: Record<ScenarioKey, string> = {
    conservative: "Conservative",
    base: "Base case",
    aggressive: "Aggressive",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
          Scenario mode
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Model alternate FAR, exit, and cost assumptions side by side. This is
          preview-only—your saved property is unchanged.
        </p>
      </div>

      <div
        className="inline-flex rounded-xl border border-stone-200/65 bg-stone-50/70 p-1 ring-1 ring-stone-900/[0.02]"
        role="tablist"
        aria-label="Scenario preset"
      >
        {(["conservative", "base", "aggressive"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={cn(
              "rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              active === key
                ? "bg-white text-neutral-950 shadow-sm"
                : "text-neutral-600 hover:text-neutral-950",
            )}
          >
            {scenarioLabel[key]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200/60 bg-white/90 p-5 ring-1 ring-stone-900/[0.03]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Assumptions — {scenarioLabel[active]}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`sc-max-${active}`}>Max FAR (override)</Label>
              <Input
                id={`sc-max-${active}`}
                inputMode="decimal"
                value={activeInputs.maxFar}
                onChange={(e) =>
                  updateScenario(active, { maxFar: e.target.value })
                }
                className="font-mono tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sc-exit-${active}`}>
                Exit $ / buildable sq ft
              </Label>
              <Input
                id={`sc-exit-${active}`}
                inputMode="decimal"
                placeholder={
                  estimatedValuePerSqft != null
                    ? `Blank → est. ${formatMoneyUsd(estimatedValuePerSqft, 2)}`
                    : "Required for project value"
                }
                value={activeInputs.exitPerBuildableSqft}
                onChange={(e) =>
                  updateScenario(active, {
                    exitPerBuildableSqft: e.target.value,
                  })
                }
                className="font-mono tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sc-cons-${active}`}>
                Construction $ / sq ft
              </Label>
              <Input
                id={`sc-cons-${active}`}
                inputMode="decimal"
                value={activeInputs.constructionPerSqft}
                onChange={(e) =>
                  updateScenario(active, {
                    constructionPerSqft: e.target.value,
                  })
                }
                className="font-mono tabular-nums"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sc-soft-${active}`}>Soft cost %</Label>
              <Input
                id={`sc-soft-${active}`}
                inputMode="decimal"
                value={activeInputs.softCostPct}
                onChange={(e) =>
                  updateScenario(active, { softCostPct: e.target.value })
                }
                className="font-mono tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-200/60 bg-stone-50/45 p-5 ring-1 ring-stone-900/[0.03]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Outputs — {scenarioLabel[active]}
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            {(() => {
              const r = results.find((x) => x.key === active);
              if (!r || !r.ok) {
                return (
                  <p className="text-sm text-amber-800">
                    Enter a valid max FAR (&gt; 0) to see outputs.
                  </p>
                );
              }
              const { dev, marginPct } = r;
              return (
                <>
                  <ScenarioDlRow
                    label="Total buildable area"
                    value={formatSqft(dev.total_buildable_sqft)}
                  />
                  <ScenarioDlRow
                    label="Unused buildable area"
                    value={formatSqft(dev.unused_buildable_sqft)}
                  />
                  <ScenarioDlRow
                    label="Project value"
                    value={formatMoney(dev.project_value)}
                  />
                  <ScenarioDlRow
                    label="Total cost"
                    value={formatMoney(dev.total_cost)}
                  />
                  <ScenarioDlRow
                    label="Estimated profit"
                    value={
                      <AnimatedMoneyValue
                        amount={dev.estimated_profit}
                        className="inline-block"
                      />
                    }
                    emphasize
                  />
                  <ScenarioDlRow
                    label="Profit margin (on cost)"
                    value={
                      marginPct != null
                        ? `${marginPct.toFixed(1)}%`
                        : "—"
                    }
                  />
                </>
              );
            })()}
          </dl>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
          Compare all scenarios
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200/60 bg-white/95">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/90 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-3 font-medium">Metric</th>
                <th className="px-3 py-3 font-medium">Conservative</th>
                <th className="px-3 py-3 font-medium">Base case</th>
                <th className="px-3 py-3 font-medium">Aggressive</th>
              </tr>
            </thead>
            <tbody className="tabular-nums text-neutral-900">
              {[
                {
                  label: "Total buildable (sq ft)",
                  pick: (d: (typeof results)[0]) =>
                    d.ok ? formatSqft(d.dev.total_buildable_sqft) : "—",
                },
                {
                  label: "Unused buildable (sq ft)",
                  pick: (d: (typeof results)[0]) =>
                    d.ok ? formatSqft(d.dev.unused_buildable_sqft) : "—",
                },
                {
                  label: "Project value",
                  pick: (d: (typeof results)[0]) =>
                    d.ok ? formatMoney(d.dev.project_value) : "—",
                },
                {
                  label: "Total cost",
                  pick: (d: (typeof results)[0]) =>
                    d.ok ? formatMoney(d.dev.total_cost) : "—",
                },
                {
                  label: "Est. profit",
                  pick: (d: (typeof results)[0]) =>
                    d.ok ? formatMoney(d.dev.estimated_profit) : "—",
                },
                {
                  label: "Margin (profit ÷ cost)",
                  pick: (d: (typeof results)[0]) => {
                    if (!d.ok) return "—";
                    const m = computeProfitMarginOnCostPercent(
                      d.dev.estimated_profit,
                      d.dev.total_cost,
                    );
                    return m != null ? `${m.toFixed(1)}%` : "—";
                  },
                },
              ].map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-neutral-50 last:border-0"
                >
                  <td className="px-3 py-2.5 text-xs font-medium text-neutral-500">
                    {row.label}
                  </td>
                  {(["conservative", "base", "aggressive"] as const).map(
                    (key) => {
                      const cell = results.find((x) => x.key === key)!;
                      return (
                        <td
                          key={key}
                          className={cn(
                            "px-3 py-2.5 font-mono text-xs font-medium",
                            active === key && "bg-neutral-50/90",
                          )}
                        >
                          {row.pick(cell)}
                        </td>
                      );
                    },
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScenarioDlRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-neutral-100/80 pb-3 last:border-0 last:pb-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        {label}
      </dt>
      <dd
        className={cn(
          "text-right font-mono text-sm tabular-nums text-neutral-950",
          emphasize && "text-base font-semibold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
