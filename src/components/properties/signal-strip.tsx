type SignalItem = {
  label: string;
  title: string;
  detail: string;
};

type SignalStripProps = {
  signals: SignalItem[];
};

/** Compact secondary intelligence — vertical rules, no cards. */
export function SignalStrip({ signals }: SignalStripProps) {
  return (
    <section
      className="rounded-xl border border-stone-300/45 bg-gradient-to-b from-stone-100/55 to-white/70 px-4 py-5 ring-1 ring-stone-900/[0.025] sm:px-5 sm:py-6"
      aria-label="Portfolio signals"
    >
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-neutral-400">
        Signal strip
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-stone-300/45">
        {signals.map((s) => (
          <div
            key={s.label}
            className="min-w-0 sm:px-6 sm:first:pl-0 sm:last:pr-0"
          >
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-neutral-400">
              {s.label}
            </p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
              {s.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
              {s.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
