"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  logSiteVisitPlanned,
  saveSiteVisitChecklist,
  saveSiteVisitNotes,
  setSiteVisited,
} from "@/app/properties/site-visit-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  SITE_VISIT_CHECKLIST_ITEMS,
  type SiteVisitChecklistId,
} from "@/lib/site-visit-checklist";
import { cn } from "@/lib/utils";

type PlanSiteVisitPanelProps = {
  propertyId: string;
  address: string;
  city: string;
  state: string;
  zoningDistrict: string;
  siteVisitedAt: string | null;
  siteVisitNotes: string | null;
  initialChecklist: Record<SiteVisitChecklistId, boolean>;
  readOnly?: boolean;
};

function mapsQuery(address: string, city: string, state: string): string {
  return `${address}, ${city}, ${state}`.trim();
}

export function PlanSiteVisitPanel({
  propertyId,
  address,
  city,
  state,
  zoningDistrict,
  siteVisitedAt,
  siteVisitNotes,
  initialChecklist,
  readOnly = false,
}: PlanSiteVisitPanelProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [notesDraft, setNotesDraft] = useState(siteVisitNotes ?? "");
  const [visited, setVisited] = useState(Boolean(siteVisitedAt));
  const [notesPending, setNotesPending] = useState(false);
  const [checkPending, setCheckPending] = useState(false);
  const [visitPending, setVisitPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setChecklist(initialChecklist);
  }, [initialChecklist]);

  useEffect(() => {
    setNotesDraft(siteVisitNotes ?? "");
  }, [siteVisitNotes]);

  useEffect(() => {
    setVisited(Boolean(siteVisitedAt));
  }, [siteVisitedAt]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
      if (!readOnly) {
        void logSiteVisitPlanned(propertyId);
      }
    } else {
      el.close();
    }
  }, [open, propertyId, readOnly]);

  const close = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
    setError(null);
  }, []);

  const query = mapsQuery(address, city, state);
  const encoded = encodeURIComponent(query);
  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  const appleUrl = `https://maps.apple.com/?q=${encoded}`;

  async function persistChecklist(
    next: Record<SiteVisitChecklistId, boolean>,
    revertTo: Record<SiteVisitChecklistId, boolean>,
  ) {
    if (readOnly) return;
    setError(null);
    setCheckPending(true);
    const res = await saveSiteVisitChecklist(propertyId, next);
    setCheckPending(false);
    if (!res.ok) {
      setChecklist(revertTo);
      setError(res.error);
      return;
    }
    router.refresh();
  }

  function toggleItem(id: SiteVisitChecklistId) {
    const prev = { ...checklist };
    const next = { ...checklist, [id]: !checklist[id] };
    setChecklist(next);
    if (readOnly) return;
    void persistChecklist(next, prev);
  }

  async function handleSaveNotes() {
    if (readOnly) return;
    setError(null);
    setNotesPending(true);
    const res = await saveSiteVisitNotes(propertyId, notesDraft);
    setNotesPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  async function handleToggleVisited() {
    if (readOnly) return;
    setError(null);
    const next = !visited;
    setVisitPending(true);
    const res = await setSiteVisited(propertyId, next);
    setVisitPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setVisited(next);
    router.refresh();
  }

  const visitedLabel = siteVisitedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(siteVisitedAt))
    : null;

  return (
    <div
      className={cn(
        "rounded-[1.05rem] border border-stone-200/60 bg-gradient-to-br from-white via-stone-50/25 to-emerald-50/[0.07]",
        "p-7 shadow-[0_2px_12px_rgba(15,23,42,0.035)] ring-1 ring-stone-900/[0.025] sm:p-8",
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
        <div className="min-w-0 max-w-xl space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-900/50">
            Site Visit Mode
          </p>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950 sm:text-xl">
            Bridge the model with what you see on the ground
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">
            Aervara is built for analysts who still walk the parcel. Open a compact field sheet
            with maps, a short look-for list, and space for observations—nothing replaces your
            own eyes on site.
          </p>
        </div>
        <div className="shrink-0">
          <Button
            type="button"
            className="h-11 rounded-xl px-6 text-sm font-semibold shadow-sm"
            onClick={() => {
              setError(null);
              setOpen(true);
            }}
          >
            {readOnly ? "Preview site visit" : "Plan Site Visit"}
          </Button>
        </div>
      </div>

      {visited && visitedLabel ? (
        <p className="mt-5 text-xs font-medium text-emerald-800/90">
          Last marked visited · {visitedLabel}
        </p>
      ) : (
        <p className="mt-5 text-xs text-neutral-400">No visit recorded yet for this property.</p>
      )}

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(calc(100vw-1.25rem),26rem)] max-h-[min(92vh,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200/80 bg-[#fafaf8] p-0",
          "shadow-[0_32px_90px_-28px_rgba(15,23,42,0.35)] ring-1 ring-stone-900/[0.06]",
          "[&::backdrop]:bg-stone-950/[0.48] [&::backdrop]:backdrop-blur-[4px]",
        )}
        aria-labelledby={titleId}
        onClose={close}
        onCancel={(ev) => {
          ev.preventDefault();
          close();
        }}
      >
        <div className="flex max-h-[min(92vh,calc(100dvh-2rem))] flex-col">
          <div className="shrink-0 border-b border-stone-200/70 bg-gradient-to-r from-stone-100/80 via-[#fafaf8] to-emerald-50/20 px-5 py-4 sm:px-6">
            <p
              id={titleId}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500"
            >
              Field sheet
            </p>
            <p className="mt-1.5 text-base font-semibold tracking-tight text-neutral-950">
              Site visit
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="rounded-xl border border-stone-200/70 bg-white px-3.5 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Address
              </p>
              <p className="mt-1.5 text-sm font-medium leading-snug text-neutral-950">{query}</p>
              <p className="mt-2 text-xs text-neutral-500">Zoning · {zoningDistrict}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-lg border-stone-200/90 bg-white px-3 text-[13px] font-semibold"
                asChild
              >
                <a href={googleUrl} target="_blank" rel="noreferrer noopener">
                  Google Maps
                </a>
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 rounded-lg border-stone-200/90 bg-white px-3 text-[13px] font-semibold"
                asChild
              >
                <a href={appleUrl} target="_blank" rel="noreferrer noopener">
                  Apple Maps
                </a>
              </Button>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-500">
                What to look for
              </p>
              <ul className="mt-3 space-y-2">
                {SITE_VISIT_CHECKLIST_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={checkPending}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex w-full gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                        "border-stone-200/80 bg-white hover:border-stone-300/90 hover:bg-stone-50/50",
                        checklist[item.id] &&
                          "border-emerald-300/70 bg-emerald-50/35 ring-1 ring-emerald-900/[0.06]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] font-bold",
                          checklist[item.id]
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-stone-300 bg-white text-transparent",
                        )}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-neutral-900">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-neutral-500">
                          {item.hint}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 rounded-xl border border-dashed border-stone-200/90 bg-stone-50/40 px-3 py-3">
              <Label htmlFor="site-visit-quick-notes" className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
                Quick notes
              </Label>
              <Textarea
                id="site-visit-quick-notes"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={3}
                maxLength={8000}
                placeholder="Parking, noise, views, anything you notice in the field…"
                className="mt-2 resize-y border-stone-200/80 bg-white text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                className="mt-3 h-8 rounded-lg px-3 text-xs font-semibold"
                disabled={notesPending}
                onClick={() => void handleSaveNotes()}
              >
                {notesPending ? "Saving…" : "Save site notes"}
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-stone-200/60 pt-5">
              <Button
                type="button"
                variant={visited ? "secondary" : "primary"}
                className="h-10 w-full rounded-xl text-sm font-semibold"
                disabled={visitPending}
                onClick={() => void handleToggleVisited()}
              >
                {visitPending
                  ? "Updating…"
                  : visited
                    ? "Clear visit record"
                    : "Mark as visited"}
              </Button>
              <p className="text-center text-[11px] leading-relaxed text-neutral-400">
                “Mark as visited” stamps this property for your own tracking—it does not notify
                Aervara staff unless you also submit a request elsewhere.
              </p>
            </div>

            {error ? (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-stone-200/70 bg-white/90 px-5 py-3 sm:px-6">
            <Button type="button" variant="ghost" className="w-full text-neutral-600" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
