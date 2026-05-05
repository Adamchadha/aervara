"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeCookPin14 } from "@/lib/property-data/normalize";
import { cn } from "@/lib/utils";

function mergePathQuery(path: string, updates: Record<string, string | null | undefined>) {
  const qm = path.indexOf("?");
  const pathname = qm >= 0 ? path.slice(0, qm) : path;
  const sp = new URLSearchParams(qm >= 0 ? path.slice(qm + 1) : "");
  for (const [k, v] of Object.entries(updates)) {
    if (v === undefined || v === null || v === "") sp.delete(k);
    else sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `${pathname}?${s}` : pathname;
}

export type ParcelPinPublicRecordsClientProps = {
  propertyPagePath: string;
  hasPersistedParcelPinApn: boolean;
  persistedPinRaw: string | null;
  persistedPinNormalized: string | null;
  previewPinRaw: string | null;
  previewPinNormalized: string | null;
  /** PIN used for Cook probes (saved columns first, then URL preview). */
  baselineCookProbePin: string | null;
  chicagoAddressReady: boolean;
};

export function ParcelPinPublicRecordsClient({
  propertyPagePath,
  hasPersistedParcelPinApn,
  persistedPinRaw,
  persistedPinNormalized,
  previewPinRaw,
  previewPinNormalized,
  baselineCookProbePin,
  chicagoAddressReady,
}: ParcelPinPublicRecordsClientProps) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => previewPinRaw ?? "");

  useEffect(() => {
    setDraft(previewPinRaw ?? "");
  }, [previewPinRaw]);

  const draftNorm = useMemo(() => normalizeCookPin14(draft.trim()), [draft]);
  const canSyncCook = Boolean(baselineCookProbePin ?? draftNorm);
  const canSync = canSyncCook || chicagoAddressReady;

  const clearPreview = useCallback(() => {
    router.push(mergePathQuery(propertyPagePath, { previewPin: null }));
  }, [propertyPagePath, router]);

  const onSyncPublicRecords = useCallback(() => {
    if (!canSync) return;
    if (!hasPersistedParcelPinApn && draftNorm) {
      router.push(mergePathQuery(propertyPagePath, { previewPin: draft.trim() }));
      return;
    }
    router.refresh();
  }, [canSync, hasPersistedParcelPinApn, draftNorm, draft, propertyPagePath, router]);

  return (
    <div className="mt-4 space-y-3">
      {!hasPersistedParcelPinApn ? (
        <div className="rounded-xl border border-stone-200/70 bg-white/80 px-3 py-2.5 sm:px-3.5 sm:py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-3 sm:gap-y-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-w-[14rem] sm:flex-row sm:items-center sm:gap-2">
              <span className="shrink-0 text-xs font-medium text-stone-800">Add parcel PIN/APN</span>
              <div className="min-w-0 flex-1">
                <label htmlFor="parcel-pin-preview" className="sr-only">
                  Parcel PIN / APN
                </label>
                <Input
                  id="parcel-pin-preview"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="e.g. 17-09-432-001-0000"
                  className="h-9 border-stone-200/80 bg-white text-sm"
                  autoComplete="off"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled
              className="h-9 shrink-0 cursor-not-allowed px-3 text-xs opacity-60"
            >
              Save to property
            </Button>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-stone-500">
            Cook County matching. Save to property is not enabled yet — use Sync public records for a session preview.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200/70 bg-white/80 px-3 py-2 sm:px-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">PIN connected</p>
          <p className="mt-0.5 font-mono text-xs font-semibold tracking-tight text-stone-900 tabular-nums sm:text-sm">
            {persistedPinNormalized ?? persistedPinRaw}
          </p>
        </div>
      )}

      {previewPinNormalized && !hasPersistedParcelPinApn ? (
        <p className="text-[11px] leading-relaxed text-stone-600">
          Previewing Cook County probes with PIN{" "}
          <span className="font-mono font-semibold text-stone-900">{previewPinNormalized}</span>{" "}
          <button
            type="button"
            onClick={clearPreview}
            className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-900"
          >
            Clear preview
          </button>
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Button
          type="button"
          variant={canSync ? "primary" : "secondary"}
          disabled={!canSync}
          onClick={onSyncPublicRecords}
          className={cn(
            "flex h-9 w-full items-center justify-center gap-2 px-3 text-sm sm:w-auto",
            !canSync && "cursor-not-allowed",
          )}
        >
          <span>Sync public records</span>
          <span
            className={cn(
              "text-[10px] font-normal uppercase tracking-[0.12em]",
              canSync ? "text-white/75" : "text-neutral-500",
            )}
          >
            Preview only
          </span>
        </Button>
      </div>

      <p className="text-[11px] leading-relaxed text-stone-500">
        Public records are queried live when this page loads. Saved fields are not overwritten until manual verification
        is enabled.
      </p>
    </div>
  );
}
