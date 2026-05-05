"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PropertyCard } from "@/components/properties/property-card";
import { propertyDetailHref } from "@/lib/demo-query";
import { formatMoney } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { computeOpportunityScores } from "@/lib/opportunity-score";
import { normalizePropertyStatus, propertyStatusBadgeClass } from "@/lib/property-status";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type PropertiesTableProps = {
  displayProperties: PropertyRow[];
  /** Total properties in the account (before filters). */
  totalPipelineCount: number;
  /** Property ids that should read as “top deal” in the list (e.g. top 3 by rank). */
  topDealPropertyIds?: ReadonlySet<string>;
  isDemo?: boolean;
  publicDemo?: boolean;
  listSurface?: "default" | "airy" | "pipeline";
};

export function PropertiesTable({
  displayProperties,
  totalPipelineCount,
  topDealPropertyIds,
  isDemo = false,
  publicDemo = false,
  listSurface = "pipeline",
}: PropertiesTableProps) {
  const topSet = topDealPropertyIds ?? new Set<string>();
  const scoreById = computeOpportunityScores(displayProperties);

  if (displayProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-stone-200/50 bg-stone-50/30 px-10 py-24 text-center">
        <p className="text-[1.05rem] font-semibold tracking-tight text-neutral-950">
          No matching properties
        </p>
        <p className="mt-4 max-w-sm text-[0.9375rem] font-normal leading-relaxed text-neutral-500">
          {totalPipelineCount === 0
            ? "Add a parcel to model FAR headroom and implied value—it will show up here."
            : "No parcels match these filters. Adjust city, state, zoning, or pipeline status—or clear filters to see your full list."}
        </p>
      </div>
    );
  }

  if (listSurface === "pipeline") {
    return (
      <div className="overflow-x-auto rounded-xl border border-stone-300/50 bg-gradient-to-b from-stone-50/60 to-white/90 ring-1 ring-stone-900/[0.035]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-stone-300/60 bg-slate-900/[0.03]">
              <Th>Address</Th>
              <Th>City</Th>
              <Th className="text-right">Implied upside</Th>
              <Th className="text-right">Score</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {displayProperties.map((p) => {
              const metrics = getDisplayMetricsForRow(p);
              const score = Math.round(scoreById.get(p.id) ?? 0);
              const status = normalizePropertyStatus(p.status);
              const isTop = topSet.has(p.id);
              return (
                <tr
                  key={p.id}
                  className={cn(
                    "border-b border-stone-200/65 last:border-b-0",
                    "transition-colors hover:bg-slate-900/[0.03]",
                    isTop && "bg-emerald-50/35",
                  )}
                >
                  <td className="px-4 py-3 text-sm font-medium text-neutral-900 sm:px-5">
                    <div className="line-clamp-1">{p.address}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600 sm:px-5">
                    {p.city}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-neutral-900 sm:px-5">
                    {formatMoney(metrics.opportunity_value ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-neutral-800 sm:px-5">
                    {score}
                  </td>
                  <td className="px-4 py-3 text-sm sm:px-5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        propertyStatusBadgeClass(status),
                      )}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    <Link
                      href={propertyDetailHref(p.id, { isDemo, publicDemo })}
                      className="inline-flex rounded-md border border-emerald-200/70 bg-emerald-50/45 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700 transition-colors hover:bg-emerald-50/80"
                    >
                      Open deal
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul className="grid gap-x-10 gap-y-16 lg:grid-cols-2 xl:gap-x-12 xl:gap-y-20">
      {displayProperties.map((p) => (
        <li key={p.id}>
          <PropertyCard
            property={p}
            emphasize={topSet.has(p.id)}
            highlightLabel={topSet.has(p.id) ? "Top deal" : undefined}
            isDemo={isDemo}
            publicDemo={publicDemo}
            opportunityScore={scoreById.get(p.id)}
            surface={listSurface}
          />
        </li>
      ))}
    </ul>
  );
}

function Th({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600 sm:px-5",
        className,
      )}
    >
      {children}
    </th>
  );
}
