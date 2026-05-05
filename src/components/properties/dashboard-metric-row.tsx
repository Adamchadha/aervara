type MetricItem = {
  label: string;
  value: string;
  hint?: string;
};

type DashboardMetricRowProps = {
  metrics: MetricItem[];
};

/** Three institutional metrics in one row — no card chrome, strong type. */
export function DashboardMetricRow({ metrics }: DashboardMetricRowProps) {
  return (
    <section
      className="rounded-xl border border-stone-300/45 bg-gradient-to-b from-stone-100/50 via-stone-50/40 to-white/70 px-4 py-6 ring-1 ring-stone-900/[0.025] sm:px-5 sm:py-7"
      aria-label="Portfolio metrics"
    >
      <div className="grid gap-7 sm:grid-cols-3 sm:gap-8 lg:gap-10">
        {metrics.map((m) => (
          <div key={m.label} className="min-w-0">
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-neutral-400">
              {m.label}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-[-0.04em] text-neutral-950 tabular-nums sm:text-[2rem]">
              {m.value}
            </p>
            {m.hint ? (
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-neutral-500">
                {m.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
