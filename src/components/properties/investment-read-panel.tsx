import { formatScorePercent } from "@/lib/far-calculations";
import type { OpportunityEngineRead } from "@/lib/opportunity-engine";
import { cn } from "@/lib/utils";

type InvestmentReadPanelProps = {
  read: OpportunityEngineRead;
  underbuiltScore: number;
  /** When true, omit outer card chrome (for use inside another panel). */
  embedded?: boolean;
};

function SubtleRule({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-px bg-gradient-to-r from-transparent via-neutral-200/55 to-transparent",
        className,
      )}
      aria-hidden
    />
  );
}

export function InvestmentReadPanel({
  read,
  underbuiltScore,
  embedded = false,
}: InvestmentReadPanelProps) {
  const inner = (
    <>
      <div className="pb-8">
        <div className="flex items-start gap-4">
          <div
            className="mt-1 h-10 w-1 shrink-0 rounded-full bg-neutral-900/90"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p
              id="investment-read-heading"
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-500"
            >
              Investment Read
            </p>
            <h2 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-neutral-950 md:text-2xl md:leading-snug">
              {read.recommendedPlay}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-neutral-600">
              {read.opportunitySummary}
            </p>
          </div>
        </div>
      </div>

      <SubtleRule className="my-2" />

      <div className="grid gap-10 py-10 sm:grid-cols-3 sm:gap-8">
        <ScoreBlock
          label="Opportunity score"
          value={formatScorePercent(underbuiltScore)}
          hint="Underbuilt vs zoning capacity"
          large
        />
        <ScoreBlock
          label="Complexity"
          value={String(read.complexityScore)}
          sub={read.complexityLabel}
          hint="Execution friction (higher = more complex)"
        />
        <ScoreBlock
          label="Speed-to-value"
          value={String(read.speedToValueScore)}
          sub={read.speedToValueLabel}
          hint="Relative timeline signal (higher = faster)"
        />
      </div>

      <SubtleRule className="my-2" />

      <div className={cn("pt-8", !embedded && "bg-white/60")}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
          Key flags
        </p>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {read.keyFlags.map((flag) => (
            <li key={flag}>
              <span className="inline-flex rounded-full border border-neutral-200/60 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-800 shadow-sm">
                {flag}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-8" aria-labelledby="investment-read-heading">
        {inner}
      </div>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-neutral-200/50 bg-gradient-to-br from-neutral-50/80 via-white to-white",
        "shadow-[0_24px_64px_-28px_rgba(15,23,42,0.14),0_2px_10px_rgba(15,23,42,0.05)] ring-1 ring-neutral-950/[0.04]",
      )}
      aria-labelledby="investment-read-heading"
    >
      <div className="px-8 pb-10 pt-10 md:px-10 md:pb-12 md:pt-11">{inner}</div>
    </section>
  );
}

function ScoreBlock({
  label,
  value,
  sub,
  hint,
  large,
}: {
  label: string;
  value: string;
  sub?: string;
  hint: string;
  large?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-3 font-mono font-semibold tabular-nums tracking-tight text-neutral-950",
          large ? "text-4xl md:text-5xl lg:text-6xl" : "text-3xl md:text-4xl lg:text-[2.5rem]",
        )}
      >
        {value}
        {sub ? (
          <span className="ml-2 font-sans text-sm font-medium tracking-normal text-neutral-500">
            · {sub}
          </span>
        ) : null}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">{hint}</p>
    </div>
  );
}
