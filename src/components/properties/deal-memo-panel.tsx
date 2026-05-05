import type { DealMemo } from "@/lib/deal-memo";
import { cn } from "@/lib/utils";

type DealMemoPanelProps = {
  memo: DealMemo;
  className?: string;
  /** Flat layout when nested in Site Room section. */
  embedded?: boolean;
};

function Rule() {
  return (
    <div
      className="my-8 h-px bg-gradient-to-r from-transparent via-neutral-200/50 to-transparent"
      aria-hidden
    />
  );
}

function DealMemoInner({ memo }: { memo: DealMemo }) {
  return (
    <>
      <div className="flex items-start gap-4">
        <div
          className="mt-1 h-12 w-1 shrink-0 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-600"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            id="deal-memo-heading"
            className="text-[11px] font-bold uppercase tracking-[0.26em] text-neutral-500"
          >
            Deal memo
          </p>
          <h3 className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Executive summary
          </h3>
          <p className="mt-4 max-w-3xl text-base leading-[1.7] text-neutral-700 sm:text-[1.0625rem]">
            {memo.executiveSummary}
          </p>
        </div>
      </div>

      <Rule />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Why it matters
          </h3>
          <ul className="mt-4 space-y-3">
            {memo.whyItMatters.map((item, i) => (
              <li
                key={`why-${i}`}
                className="border-l border-neutral-200/90 pl-4 text-sm leading-relaxed text-neutral-700"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Key risks
          </h3>
          <ul className="mt-4 space-y-3">
            {memo.keyRisks.map((item, i) => (
              <li
                key={`risk-${i}`}
                className="border-l border-neutral-200/90 pl-4 text-sm leading-relaxed text-neutral-600"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-11 rounded-xl border border-neutral-200/50 bg-neutral-50/40 px-5 py-4 shadow-sm ring-1 ring-neutral-950/[0.025] sm:px-6 sm:py-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
          Suggested next step
        </p>
        <p className="mt-2.5 text-sm font-semibold tracking-tight text-neutral-950 sm:text-base">
          {memo.suggestedNextStep}
        </p>
      </div>
    </>
  );
}

export function DealMemoPanel({
  memo,
  className,
  embedded = false,
}: DealMemoPanelProps) {
  if (embedded) {
    return (
      <div className={cn("space-y-2", className)} aria-labelledby="deal-memo-heading">
        <DealMemoInner memo={memo} />
      </div>
    );
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.25rem] border border-neutral-200/45 bg-gradient-to-b from-white via-white to-neutral-50/25 p-9 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.09),0_2px_10px_rgba(15,23,42,0.035)] ring-1 ring-neutral-950/[0.03] md:p-11",
        className,
      )}
      aria-labelledby="deal-memo-heading"
    >
      <DealMemoInner memo={memo} />
    </section>
  );
}
