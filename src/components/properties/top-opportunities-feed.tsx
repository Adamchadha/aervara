import Link from "next/link";
import { formatMoney } from "@/lib/far-calculations";
import { withDemoQuery } from "@/lib/demo-query";
import {
  selectTopByLowestComplexity,
  selectTopByOpportunityValue,
  selectTopBySpeedToValue,
} from "@/lib/dashboard-opportunity-feed";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { cn } from "@/lib/utils";
import type { PropertyRow } from "@/types/property";

type TopOpportunitiesFeedProps = {
  properties: PropertyRow[];
  isDemo?: boolean;
};

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-transform duration-300 ease-out group-hover:scale-105",
        rank === 1 &&
          "bg-neutral-950 text-white shadow-[0_2px_8px_rgba(15,23,42,0.2)]",
        rank === 2 && "bg-stone-200/90 text-neutral-900 ring-1 ring-stone-300/50",
        rank === 3 &&
          "bg-stone-50 text-neutral-600 ring-1 ring-stone-200/90",
      )}
      aria-hidden
    >
      {rank}
    </span>
  );
}

function FeedColumn({
  title,
  subtitle,
  rows,
  metric,
  isDemo,
}: {
  title: string;
  subtitle: string;
  rows: PropertyRow[];
  metric: (p: PropertyRow) => string;
  isDemo: boolean;
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200/55 bg-white/95 p-6 shadow-[0_2px_8px_rgba(15,23,42,0.03),0_20px_48px_-24px_rgba(15,23,42,0.08)] ring-1 ring-stone-900/[0.025] transition-shadow duration-500 ease-out hover:shadow-[0_8px_28px_-12px_rgba(15,23,42,0.1),0_2px_8px_rgba(15,23,42,0.04)]">
      <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
        {title}
      </h3>
      <p className="mt-1 text-[11px] font-normal leading-snug tracking-wide text-neutral-500">
        {subtitle}
      </p>
      <ul className="mt-5 space-y-1">
        {rows.map((p, i) => (
          <li key={p.id}>
            <Link
              href={withDemoQuery(`/properties/${p.id}`, isDemo)}
              className="group flex items-start gap-3 rounded-xl px-2 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-stone-50/90 hover:shadow-[inset_0_0_0_1px_rgba(231,229,228,0.6)]"
            >
              <RankBadge rank={i + 1} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-neutral-950 decoration-neutral-400/60 underline-offset-4 transition-[text-decoration-color] duration-300 group-hover:underline">
                  {p.address}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-normal text-neutral-500">
                  {p.city}, {p.state}
                </p>
                <p className="mt-1.5 font-mono text-[0.8125rem] font-semibold tabular-nums tracking-tight text-neutral-800">
                  {metric(p)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopOpportunitiesFeed({
  properties,
  isDemo = false,
}: TopOpportunitiesFeedProps) {
  if (properties.length === 0) return null;

  const byValue = selectTopByOpportunityValue(properties, 3);
  const bySpeed = selectTopBySpeedToValue(properties, 3);
  const bySimplicity = selectTopByLowestComplexity(properties, 3);

  return (
    <section
      className="space-y-7"
      aria-labelledby="top-opportunities-feed-heading"
    >
      <div>
        <h2
          id="top-opportunities-feed-heading"
          className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400"
        >
          Top opportunities feed
        </h2>
        <p className="mt-2 text-[0.9375rem] font-normal leading-relaxed text-neutral-500">
          Refreshes whenever you open the dashboard—new deals slot in automatically.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 md:gap-7">
        <FeedColumn
          title="Highest opportunity"
          subtitle="By modeled opportunity value"
          rows={byValue}
          isDemo={isDemo}
          metric={(p) => {
            const v = getDisplayMetricsForRow(p).opportunity_value;
            return v != null ? formatMoney(v) : "—";
          }}
        />
        <FeedColumn
          title="Fastest to value"
          subtitle="By speed-to-value score"
          rows={bySpeed}
          isDemo={isDemo}
          metric={(p) => {
            const r = getOpportunityEngineRead(p);
            return `${r.speedToValueScore} · ${r.speedToValueLabel}`;
          }}
        />
        <FeedColumn
          title="Lowest complexity"
          subtitle="Easier execution profile"
          rows={bySimplicity}
          isDemo={isDemo}
          metric={(p) => {
            const r = getOpportunityEngineRead(p);
            return `${r.complexityScore} · ${r.complexityLabel}`;
          }}
        />
      </div>
    </section>
  );
}
