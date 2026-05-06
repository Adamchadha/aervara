"use client";

import { useCallback, useEffect, useState } from "react";

export type DevelopmentEnvelopeBannerProps = {
  zoning: string;
  unusedSqft: string;
  modeledFar: string;
  modalFarHeadroom: string;
  modalModeledUpside: string;
  /** When false, omit bottom margin so parent `space-y-*` controls vertical rhythm (e.g. demo hub). */
  trailingMargin?: boolean;
};

export function DevelopmentEnvelopeBanner({
  zoning,
  unusedSqft,
  modeledFar,
  modalFarHeadroom,
  modalModeledUpside,
  trailingMargin = true,
}: DevelopmentEnvelopeBannerProps) {
  const [developmentEnvelopeOpen, setDevelopmentEnvelopeOpen] = useState(false);

  const close = useCallback(() => setDevelopmentEnvelopeOpen(false), []);

  useEffect(() => {
    if (!developmentEnvelopeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [developmentEnvelopeOpen, close]);

  useEffect(() => {
    if (!developmentEnvelopeOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [developmentEnvelopeOpen]);

  return (
    <>
      <div className={trailingMargin ? "mb-16" : ""}>
        <button
          type="button"
          onClick={() => setDevelopmentEnvelopeOpen(true)}
          className="group relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#071827] p-8 text-left text-white shadow-[0_20px_60px_rgba(2,6,23,0.25)] transition duration-300 hover:shadow-[0_28px_72px_rgba(2,6,23,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf6]"
        >
        <img
          src="/images/aervara-floor-plan-overlay.png"
          alt=""
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center opacity-[0.38] [filter:contrast(1.12)_brightness(1.06)_saturate(0.92)]"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#071827]/96 via-[#071827]/82 to-[#071827]/65" />

        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
            Development envelope
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85">
              Illustrative only
            </span>
            <p className="max-w-md text-[10px] leading-snug text-white/55">
              Not a surveyed parcel boundary or approved building footprint.
            </p>
          </div>
          <p className="mt-2 max-w-md text-[10px] leading-snug text-white/50">
            Illustrative envelope view — verify with parcel geometry and official records.
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
            Floor plan logic, FAR capacity, and buildable-area assumptions in one view.
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-white/82">
            Use this parcel memo to review modeled area, vertical capacity, and
            redevelopment assumptions before opening deeper scenario analysis.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-white/50">Zoning</p>
              <p className="mt-1 font-semibold text-white">{zoning}</p>
            </div>
            <div>
              <p className="text-white/50">Unused area</p>
              <p className="mt-1 font-semibold text-white">{unusedSqft}</p>
            </div>
            <div>
              <p className="text-white/50">Modeled FAR</p>
              <p className="mt-1 font-semibold text-white">{modeledFar}</p>
            </div>
          </div>

          <span className="mt-6 inline-flex items-center rounded-full bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#071827] shadow-[0_8px_24px_rgba(2,6,23,0.18)] transition-opacity duration-200 hover:opacity-90">
            Learn how this is calculated →
          </span>
        </div>
      </button>
      </div>

      {developmentEnvelopeOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="development-envelope-modal-title"
            className="relative max-h-[90vh] max-w-2xl overflow-y-auto overflow-x-hidden rounded-[2rem] border border-stone-200 bg-[#fbfaf6] p-8 shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute right-5 top-5 rounded-full border border-stone-200 bg-white px-3 py-1 text-sm text-stone-600 hover:text-stone-950"
            >
              Close
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">
              Development envelope
            </p>

            <h3
              id="development-envelope-modal-title"
              className="mt-4 text-3xl font-bold tracking-tight text-stone-950"
            >
              How Aervara reads vertical capacity.
            </h3>

            <p className="mt-4 text-base leading-relaxed text-stone-700">
              The development envelope compares what is currently built against the zoning
              ceiling. Aervara uses lot area, built floor area, maximum FAR, and estimated value
              per buildable square foot to estimate unused buildable area and modeled upside.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Unused area</p>
                <p className="mt-2 text-xl font-bold text-stone-950">{unusedSqft}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">FAR headroom</p>
                <p className="mt-2 text-xl font-bold text-stone-950">{modalFarHeadroom}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Modeled upside</p>
                <p className="mt-2 text-xl font-bold text-stone-950">{modalModeledUpside}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
