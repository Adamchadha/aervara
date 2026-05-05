"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  createProperty,
  type CreatePropertyState,
} from "@/app/properties/actions";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  computeOpportunityMetrics,
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatSqft,
} from "@/lib/far-calculations";
import {
  computeDevelopmentAnalysis,
  DEFAULT_SOFT_COST_PCT,
} from "@/lib/development-analysis";
import { inferMaxFarFromZoning } from "@/lib/zoning-max-far";

const initialState: CreatePropertyState = {};

function fieldError(
  fieldErrors: Record<string, string[] | undefined> | undefined,
  key: string,
) {
  const e = fieldErrors?.[key];
  return e?.[0];
}

function parseOptionalRate(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

type PropertyFormProps = {
  readOnly?: boolean;
  /** `?demo=true` session — server action rejects saves when set. */
  demoPreview?: boolean;
  cancelHref?: string;
};

export function PropertyForm({
  readOnly = false,
  demoPreview = false,
  cancelHref = "/dashboard",
}: PropertyFormProps) {
  const [state, formAction, pending] = useActionState(
    createProperty,
    initialState,
  );

  const [lotSize, setLotSize] = useState("");
  const [built, setBuilt] = useState("");
  const [maxFar, setMaxFar] = useState("");
  const [zoningDistrict, setZoningDistrict] = useState("");
  const [ratePerSf, setRatePerSf] = useState("");
  const [constructionPerSf, setConstructionPerSf] = useState("");
  const [softPct, setSoftPct] = useState(String(DEFAULT_SOFT_COST_PCT));
  const [exitPerSf, setExitPerSf] = useState("");

  const live = useMemo(() => {
    const lot = Number(lotSize);
    const builtN = Number(built);
    const maxF = Number(maxFar);
    const rate = parseOptionalRate(ratePerSf);
    if (!Number.isFinite(lot) || lot <= 0) {
      return null;
    }
    if (!Number.isFinite(maxF) || maxF <= 0) {
      return null;
    }
    if (!Number.isFinite(builtN) || builtN < 0) {
      return null;
    }
    return computeOpportunityMetrics(lot, builtN, maxF, rate);
  }, [lotSize, built, maxFar, ratePerSf]);

  const liveDev = useMemo(() => {
    if (!live) return null;
    const lot = Number(lotSize);
    const builtN = Number(built);
    const maxF = Number(maxFar);
    const est = parseOptionalRate(ratePerSf);
    const cons = parseOptionalRate(constructionPerSf);
    const exit = parseOptionalRate(exitPerSf);
    const softRaw = softPct.trim();
    const softNum =
      softRaw === ""
        ? DEFAULT_SOFT_COST_PCT
        : Number(softRaw);
    const softCostPct =
      Number.isFinite(softNum) && softNum >= 0
        ? Math.min(100, softNum)
        : DEFAULT_SOFT_COST_PCT;
    return computeDevelopmentAnalysis({
      lotSizeSqft: lot,
      builtFloorAreaSqft: builtN,
      maxFar: maxF,
      estimatedValuePerBuildableSqft: est,
      constructionCostPerSqft: cons,
      softCostPercentage: softCostPct,
      exitValuePerSqft: exit,
    });
  }, [
    live,
    lotSize,
    built,
    maxFar,
    ratePerSf,
    constructionPerSf,
    softPct,
    exitPerSf,
  ]);

  return (
    <form
      action={formAction}
      className="mx-auto max-w-2xl space-y-8"
      onSubmit={(e) => {
        if (readOnly) e.preventDefault();
      }}
    >
      {demoPreview ? <input type="hidden" name="demo_preview" value="1" /> : null}
      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}

      <fieldset
        disabled={readOnly}
        className="min-w-0 space-y-8 border-0 p-0 disabled:opacity-60"
      >
        <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Location
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Street address</Label>
            <Input
              id="address"
              name="address"
              required
              autoComplete="street-address"
            />
            {fieldError(state.fieldErrors, "address") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "address")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required autoComplete="address-level2" />
            {fieldError(state.fieldErrors, "city") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "city")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              required
              autoComplete="address-level1"
            />
            {fieldError(state.fieldErrors, "state") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "state")}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Zoning &amp; envelope
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="zoning_district">Zoning district</Label>
            <Input
              id="zoning_district"
              name="zoning_district"
              required
              value={zoningDistrict}
              onChange={(e) => {
                const z = e.target.value;
                setZoningDistrict(z);
                if (!maxFar.trim()) {
                  setMaxFar(String(inferMaxFarFromZoning(z)));
                }
              }}
            />
            {fieldError(state.fieldErrors, "zoning_district") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "zoning_district")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lot_size_sqft">Lot size (sq ft)</Label>
            <Input
              id="lot_size_sqft"
              name="lot_size_sqft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              required
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
            />
            {fieldError(state.fieldErrors, "lot_size_sqft") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "lot_size_sqft")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="built_floor_area_sqft">Built floor area (sq ft)</Label>
            <Input
              id="built_floor_area_sqft"
              name="built_floor_area_sqft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              required
              value={built}
              onChange={(e) => setBuilt(e.target.value)}
            />
            {fieldError(state.fieldErrors, "built_floor_area_sqft") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "built_floor_area_sqft")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_far">Max FAR (as-of-right)</Label>
            <Input
              id="max_far"
              name="max_far"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={maxFar}
              onChange={(e) => setMaxFar(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Auto-estimated from zoning. You can override if you have a more precise as-of-right FAR.
            </p>
            {fieldError(state.fieldErrors, "max_far") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "max_far")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="estimated_value_per_sqft">
              Est. value per buildable sq ft (optional)
            </Label>
            <Input
              id="estimated_value_per_sqft"
              name="estimated_value_per_sqft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 450"
              value={ratePerSf}
              onChange={(e) => setRatePerSf(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Used to estimate opportunity value from unused buildable area.
            </p>
            {fieldError(state.fieldErrors, "estimated_value_per_sqft") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "estimated_value_per_sqft")}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Live opportunity summary
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Updates as you type. Air rights value needs lot, FAR inputs, and
          optional $/sq ft.
        </p>
        {live ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric
              label="Max buildable area"
              value={`${formatSqft(live.max_buildable_sqft)} sq ft`}
            />
            <Metric
              label="Current built FAR"
              value={formatFar(live.current_built_far)}
            />
            <Metric
              label="Unused vertical capacity"
              value={formatFar(live.remaining_far)}
            />
            <Metric
              label="Unused buildable area"
              value={`${formatSqft(live.unused_buildable_sqft)} sq ft`}
            />
            <Metric
              label="Underbuilt score"
              value={`${live.underbuilt_score}%`}
            />
            <Metric
              label="Air rights value"
              value={
                <AnimatedMoneyValue amount={live.opportunity_value} />
              }
              emphasize
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Enter a positive lot size and max FAR to see metrics.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Development analysis
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="construction_cost_per_sqft">
              Construction cost per sq ft
            </Label>
            <Input
              id="construction_cost_per_sqft"
              name="construction_cost_per_sqft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 275"
              value={constructionPerSf}
              onChange={(e) => setConstructionPerSf(e.target.value)}
            />
            {fieldError(state.fieldErrors, "construction_cost_per_sqft") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "construction_cost_per_sqft")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="soft_cost_percentage">Soft cost (%)</Label>
            <Input
              id="soft_cost_percentage"
              name="soft_cost_percentage"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="any"
              value={softPct}
              onChange={(e) => setSoftPct(e.target.value)}
            />
            <p className="text-xs text-neutral-500">
              Applied to hard construction cost. Default {DEFAULT_SOFT_COST_PCT}
              %.
            </p>
            {fieldError(state.fieldErrors, "soft_cost_percentage") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "soft_cost_percentage")}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="exit_value_per_sqft">
              Exit value per buildable sq ft (optional)
            </Label>
            <Input
              id="exit_value_per_sqft"
              name="exit_value_per_sqft"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="Uses est. value / buildable sq ft if blank"
              value={exitPerSf}
              onChange={(e) => setExitPerSf(e.target.value)}
            />
            {fieldError(state.fieldErrors, "exit_value_per_sqft") ? (
              <p className="text-sm text-red-600">
                {fieldError(state.fieldErrors, "exit_value_per_sqft")}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Live development summary
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          Uses unused buildable area from your FAR inputs. Exit value falls back
          to est. value per buildable sq ft when omitted.
        </p>
        {liveDev ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <Metric
              label="Total buildable area"
              value={`${formatSqft(liveDev.total_buildable_sqft)} sq ft`}
            />
            <Metric
              label="Unused buildable area"
              value={`${formatSqft(liveDev.unused_buildable_sqft)} sq ft`}
            />
            <Metric
              label="Construction cost"
              value={formatMoney(liveDev.construction_cost)}
            />
            <Metric
              label="Soft cost"
              value={formatMoney(liveDev.soft_cost)}
            />
            <Metric
              label="Total cost"
              value={formatMoney(liveDev.total_cost)}
            />
            <Metric
              label="Project value"
              value={formatMoney(liveDev.project_value)}
            />
            <Metric
              label="Effective exit $/sf"
              value={
                liveDev.effective_exit_per_sqft != null
                  ? formatMoneyUsd(liveDev.effective_exit_per_sqft, 2)
                  : "—"
              }
            />
            <Metric
              label="Estimated profit"
              value={<AnimatedMoneyValue amount={liveDev.estimated_profit} />}
              emphasize
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-neutral-500">
            Complete lot size and FAR above to model development costs.
          </p>
        )}
      </section>

      <section className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Sources, assumptions, contacts…"
        />
        {fieldError(state.fieldErrors, "notes") ? (
          <p className="text-sm text-red-600">
            {fieldError(state.fieldErrors, "notes")}
          </p>
        ) : null}
      </section>

      </fieldset>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" asChild className="sm:w-auto">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending || readOnly} className="sm:w-auto">
          {pending ? "Submitting…" : "Submit building"}
        </Button>
      </div>
    </form>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: ReactNode;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2.5 ${
        emphasize
          ? "border-neutral-900 bg-white shadow-sm"
          : "border-neutral-200 bg-white/80"
      }`}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 font-mono text-sm font-semibold tabular-nums text-neutral-950 ${
          emphasize ? "text-base" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
