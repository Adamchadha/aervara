import Link from "next/link";
import type { ReactNode } from "react";
import { AnimatedMoneyValue } from "@/components/ui/animated-money-value";
import { Button } from "@/components/ui/button";
import { DealConfidenceMeter } from "@/components/properties/deal-confidence-meter";
import { DealMemoPanel } from "@/components/properties/deal-memo-panel";
import { InvestmentReadPanel } from "@/components/properties/investment-read-panel";
import { AmenityActivationSection } from "@/components/properties/amenity-activation-section";
import { SiteRoomSection } from "@/components/properties/site-room-section";
import { TakeActionPanel } from "@/components/properties/take-action-panel";
import type { DealConfidence } from "@/lib/deal-confidence";
import type { DealMemo } from "@/lib/deal-memo";
import { demoAwarePath, requestFullAccessHref } from "@/lib/demo-flow";
import {
  formatFar,
  formatMoney,
  formatMoneyUsd,
  formatScorePercent,
  formatSqft,
} from "@/lib/far-calculations";
import { cn } from "@/lib/utils";
import type { OpportunityEngineRead } from "@/lib/opportunity-engine";
import type { PropertyDisplayMetrics } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

function DetailMetricRow({
  label,
  value,
  score,
}: {
  label: string;
  value: ReactNode;
  score?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-8 border-b border-stone-100/70 py-4 sm:border-0 sm:py-3.5">
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-neutral-400">
        {label}
      </dt>
      <dd
        className={`text-right font-mono font-medium tabular-nums text-neutral-950 ${
          score
            ? "text-[1.35rem] font-semibold tracking-[-0.02em] sm:text-2xl sm:tracking-tight"
            : "text-[0.9375rem] font-normal text-neutral-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

type PublicDemoPropertyExperienceProps = {
  property: PropertyRow;
  metrics: PropertyDisplayMetrics;
  dealMemo: DealMemo;
  engineRead: OpportunityEngineRead;
  dealConfidence: DealConfidence;
  viewerRole: string | null;
  dealRoom: boolean;
  lotSqft: number;
  builtSqft: number;
  maxFar: number;
  estValuePerSqft: number | null;
  /** Hub link (default: dashboard with demo query). */
  backHref?: string;
  /** Apply-flow paths for Request Full Access (default: property URL with demo). */
  applyNextPath?: string;
  applySourcePath?: string;
  /** Label for the hub link above the fold (default: Back to dashboard). */
  backLinkLabel?: string;
  /** Cinematic hero replaces the marketing fold — start at Site Room sections. */
  suppressMarketingHeader?: boolean;
};

/**
 * Curated Site Room for `?demo=true`: thesis, FAR story, and primary motions—without
 * the full collaboration stack.
 */
export function PublicDemoPropertyExperience({
  property: p,
  metrics: m,
  dealMemo,
  engineRead,
  dealConfidence,
  viewerRole,
  dealRoom,
  lotSqft: lot,
  builtSqft: built,
  maxFar,
  estValuePerSqft: est,
  backHref: backHrefProp,
  applyNextPath,
  applySourcePath,
  backLinkLabel,
  suppressMarketingHeader = false,
}: PublicDemoPropertyExperienceProps) {
  const backHref = backHrefProp ?? demoAwarePath("/dashboard", true);
  const accessHref = requestFullAccessHref({
    nextPath:
      applyNextPath ?? demoAwarePath(`/properties/${p.id}`, true),
    sourceRoute:
      applySourcePath ?? demoAwarePath(`/properties/${p.id}`, true),
  });
  const whyItMattersText = dealMemo.whyItMatters
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={
        suppressMarketingHeader
          ? "w-full max-w-none space-y-10 pb-10 pt-0 lg:space-y-11 lg:pb-12"
          : "mx-auto max-w-5xl space-y-14 pb-12 pt-2 lg:space-y-16 lg:pb-16 lg:pt-4"
      }
    >
      {!suppressMarketingHeader ? (
        <header className="rounded-[1.2rem] border border-stone-200/50 bg-gradient-to-br from-white via-sky-50/20 to-white px-6 py-9 shadow-[0_2px_10px_rgba(15,23,42,0.035)] ring-1 ring-stone-900/[0.025] sm:px-10 sm:py-10">
          <Link
            href={backHref}
            className="-ml-1 inline-flex rounded-xl px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-stone-100/90 hover:text-neutral-950"
          >
            {backLinkLabel ?? "← Back to dashboard"}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-sky-200/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-900/90">
              Demo Preview
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Site Room
            </span>
          </div>
          <h1 className="mt-5 max-w-[46rem] text-pretty text-[1.75rem] font-semibold leading-[1.17] tracking-[-0.032em] text-neutral-950 sm:text-[2rem] lg:text-[2.2rem]">
            {p.address}
          </h1>
          <p className="mt-2 text-sm font-medium text-neutral-600">
            {p.city}, {p.state} · {p.zoning_district}
          </p>
          <p className="mt-4 max-w-3xl text-[0.98rem] leading-relaxed text-neutral-700">
            {whyItMattersText ||
              "This parcel appears underbuilt relative to zoning, which can translate into meaningful upside when additional floor area can be legally unlocked."}
          </p>

          <div className="mt-8 grid gap-8 border-t border-stone-200/50 pt-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
            <div className="space-y-5 text-sm leading-relaxed text-neutral-700">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Plain-English read
                </p>
                <p className="mt-2">
                  <span className="font-semibold text-neutral-900">Air-rights-style value</span>{" "}
                  means this site may support more floor area than what is currently built.
                  That gap can become investable upside if zoning and execution line up.
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Underbuilt signal
                </p>
                <p className="mt-2">
                  The{" "}
                  <span className="font-semibold text-neutral-900">underbuilt score</span>{" "}
                  compares existing built density to allowable density. Higher scores
                  usually indicate more room to create value without expanding the lot.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200/60 bg-white/90 px-5 py-5 shadow-sm ring-1 ring-stone-900/[0.02]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Snapshot
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-tight text-neutral-950 tabular-nums">
                {formatMoney(m.opportunity_value)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">Modeled opportunity value</p>
              <dl className="mt-5 space-y-1 border-t border-stone-100 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Underbuilt</dt>
                  <dd className="font-medium text-neutral-900">
                    {formatScorePercent(m.underbuilt_score)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Unused FAR</dt>
                  <dd className="font-medium text-neutral-900">
                    {formatFar(m.unused_vertical_capacity)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <Button
                  asChild
                  className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
                >
                  <Link href={accessHref}>Request Full Access</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
      ) : null}

      <SiteRoomSection
        id={suppressMarketingHeader ? "site-room" : "why-deal"}
        step="01"
        label="Deal rationale"
        title="Why this is a deal"
        description="A simple underwriting lens for investors, developers, and brokers."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200/70 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Investors
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Screen for parcels where unused FAR can expand stabilized value beyond
              current pricing assumptions.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/70 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Developers
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Prioritize sites where density headroom and execution complexity suggest
              real feasibility, not just theoretical upside.
            </p>
          </div>
          <div className="rounded-xl border border-stone-200/70 bg-white px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Brokers
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Frame opportunities around unused envelope and speed-to-value so buyers
              understand the development angle early.
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-stone-200/70 bg-stone-50/70 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Executive take
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-700">
            {dealMemo.executiveSummary}
          </p>
        </div>
      </SiteRoomSection>

      <SiteRoomSection
        id="opportunity-snapshot"
        step="02"
        label="Opportunity snapshot"
        title="The thesis in numbers"
        description="Implied upside from unused buildable envelope, with a conviction read from Aervara’s opportunity engine."
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Air rights value
        </p>
        <AnimatedMoneyValue
          amount={m.air_rights_value}
          className="mt-5 text-[2.2rem] font-semibold tracking-[-0.035em] text-neutral-950 tabular-nums sm:text-5xl sm:tracking-[-0.04em] md:text-[3.1rem] lg:text-[3.45rem] lg:leading-[1.02]"
        />
        <div className="mt-6 max-w-2xl rounded-xl border border-stone-200/70 bg-white/70 px-5 py-4 text-sm leading-relaxed text-neutral-600">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Why this matters
          </p>
          <p className="mt-2">
            Air rights are the unbuilt vertical envelope. This is the cleanest proxy for
            whether the parcel can support higher-order density value without changing
            the land footprint.
          </p>
        </div>
        <div className="mt-8 max-w-sm">
          <DealConfidenceMeter confidence={dealConfidence} />
        </div>
      </SiteRoomSection>

      <SiteRoomSection
        id="take-action"
        step="03"
        label="Next step"
        title="Move the deal"
        description="Request a call, meeting, or introduction—previewed here as access-request actions."
        density="compact"
      >
        {dealRoom ? (
          <TakeActionPanel
            propertyId={p.id}
            viewerRole={viewerRole}
            readOnly
            isDemo
            demoApplyNextPath={applyNextPath}
            demoApplySourcePath={applySourcePath}
          />
        ) : (
          <p className="text-sm text-neutral-600">
            Deal-room coordination for this parcel is available in the full product.
          </p>
        )}
      </SiteRoomSection>

      <SiteRoomSection
        id="parcel-far"
        step="04"
        label="Parcel & FAR"
        title="Envelope at a glance"
        description="Lot size, built area, and how much FAR is still on the table."
        density={suppressMarketingHeader ? "compact" : "default"}
        className={
          suppressMarketingHeader
            ? "[&>header]:py-5 sm:[&>header]:px-8 sm:[&>header]:py-6"
            : undefined
        }
      >
        <dl
          className={cn(
            "grid gap-x-8 sm:grid-cols-2 lg:max-w-4xl lg:gap-x-12",
            suppressMarketingHeader ? "gap-y-1.5" : "gap-y-2",
          )}
        >
          <DetailMetricRow label="Lot size (sq ft)" value={formatSqft(lot)} />
          <DetailMetricRow
            label="Built floor area (sq ft)"
            value={formatSqft(built)}
          />
          <DetailMetricRow label="Max FAR" value={formatFar(maxFar)} />
          <DetailMetricRow
            label="Current built FAR"
            value={formatFar(m.current_built_far)}
          />
          <DetailMetricRow
            label="Unused vertical capacity"
            value={formatFar(m.unused_vertical_capacity)}
          />
          <DetailMetricRow
            label="Underbuilt score"
            value={formatScorePercent(m.underbuilt_score)}
            score
          />
          <DetailMetricRow
            label="Est. value per buildable sq ft"
            value={
              est != null && est > 0 ? formatMoneyUsd(est, 2) : "—"
            }
          />
        </dl>
      </SiteRoomSection>

      <SiteRoomSection
        id="amenity-activation-demo"
        step="05"
        label="Amenity signal"
        title="Amenity activation potential"
        description="Unused envelope can support more than units — it can create differentiated tenant and resident experiences."
      >
        <AmenityActivationSection
          embedded
          unusedBuildableSqft={Number(m.unused_buildable_sqft ?? 0)}
          totalBuildableSqft={lot * maxFar}
        />
      </SiteRoomSection>

      <SiteRoomSection
        id="investment-read-demo"
        step="06"
        label="Diligence"
        title="How Aervara reads it"
        description="A structured diligence read designed for institutional decision-making."
      >
        <div className="rounded-2xl border border-stone-200/70 bg-white/85 px-5 py-5 shadow-sm ring-1 ring-stone-900/[0.02] sm:px-6 sm:py-6">
          <InvestmentReadPanel
            embedded
            read={engineRead}
            underbuiltScore={m.underbuilt_score}
          />
          <div className="mt-10 border-t border-stone-100 pt-10">
            <DealMemoPanel embedded memo={dealMemo} />
          </div>
        </div>
      </SiteRoomSection>

      <p className="pb-6 text-center text-xs text-neutral-500">
        Read-only preview—imports, edits, billing, and live coordination are off in
        demo mode.{" "}
        <Link
          href={accessHref}
          className="font-medium text-stone-800 underline-offset-2 hover:underline"
        >
          Request Full Access
        </Link>
        .
      </p>
    </div>
  );
}
