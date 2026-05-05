"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { deleteProperty } from "@/app/properties/actions";
import { DealInterestButton } from "@/components/properties/deal-interest-button";
import { DownloadDealReportButton } from "@/components/properties/download-deal-report-button";
import { RequestIntroductionButton } from "@/components/properties/request-introduction-button";
import { RequestMeetingButton } from "@/components/properties/request-meeting-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DealReportPayload } from "@/types/deal-report-payload";

const MEMO_PANEL_ACTION_CLASS =
  "h-9 w-full rounded-xl border border-stone-200/80 bg-white/95 px-4 text-[13px] font-medium text-stone-900 shadow-sm transition-all duration-150 hover:scale-[1.01] hover:bg-white hover:border-stone-200 active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100";

type PropertySiteRoomActionsProps = {
  propertyId: string;
  viewerRole: string | null;
  dealReportPayload: DealReportPayload;
  addressForFilename: string;
  proLocked: boolean;
  readOnly?: boolean;
};

export function PropertySiteRoomActions({
  propertyId,
  viewerRole,
  dealReportPayload,
  addressForFilename,
  proLocked,
  readOnly = false,
}: PropertySiteRoomActionsProps) {
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moreMenuBox, setMoreMenuBox] = useState<CSSProperties | null>(null);
  const moreActionsRef = useRef<HTMLDetailsElement>(null);
  const moreMenuPortalRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!moreOpen) {
      setMoreMenuBox(null);
      return;
    }
    function updateMenuBox() {
      const details = moreActionsRef.current;
      if (!details) return;
      const rect = details.getBoundingClientRect();
      const gap = 12;
      setMoreMenuBox({
        position: "fixed",
        top: rect.bottom + gap,
        right: Math.max(16, window.innerWidth - rect.right),
        width: 256,
        zIndex: 9999,
      });
    }
    updateMenuBox();
    window.addEventListener("resize", updateMenuBox);
    window.addEventListener("scroll", updateMenuBox, true);
    return () => {
      window.removeEventListener("resize", updateMenuBox);
      window.removeEventListener("scroll", updateMenuBox, true);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(ev: PointerEvent) {
      const target = ev.target as Node;
      const details = moreActionsRef.current;
      if (details?.contains(target)) return;
      if (moreMenuPortalRef.current?.contains(target)) return;
      if (details) details.open = false;
      setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [moreOpen]);

  useEffect(() => {
    if (deleteConfirmOpen && moreActionsRef.current) {
      moreActionsRef.current.open = false;
      setMoreOpen(false);
    }
  }, [deleteConfirmOpen]);

  function runDelete() {
    if (readOnly) return;
    setDeleteError(null);
    setDeleteConfirmOpen(false);
    startDelete(async () => {
      const result = await deleteProperty(propertyId);
      if (result?.success === false) {
        setDeleteError(result.message);
      }
    });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {deleteConfirmOpen ? (
        <div
          className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-950 shadow-sm"
          role="dialog"
          aria-labelledby="delete-property-confirm-title"
        >
          <p id="delete-property-confirm-title" className="font-medium">
            Delete this property?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-red-900/85">
            This cannot be undone. All deal room data tied to this parcel will be
            removed from your workspace.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-9 rounded-xl px-4 text-[13px]"
              disabled={deletePending}
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-9 rounded-xl px-4 text-[13px]"
              disabled={deletePending}
              onClick={runDelete}
            >
              {deletePending ? "Deleting…" : "Delete permanently"}
            </Button>
          </div>
        </div>
      ) : null}
      {deleteError ? (
        <p className="text-xs text-red-700" role="alert">
          {deleteError}
        </p>
      ) : null}
      <div className="flex w-full flex-col gap-3">
        {readOnly ? (
          <Button
            variant="secondary"
            disabled
            className={cn(MEMO_PANEL_ACTION_CLASS, "opacity-60")}
            title="Edit is disabled in Pro Preview"
          >
            Edit property
          </Button>
        ) : (
          <Button variant="secondary" asChild className={MEMO_PANEL_ACTION_CLASS}>
            <Link href={`/properties/${propertyId}/edit`}>Edit property</Link>
          </Button>
        )}
        <RequestIntroductionButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          className={MEMO_PANEL_ACTION_CLASS}
          disabled={readOnly}
        />
        <RequestMeetingButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          className={MEMO_PANEL_ACTION_CLASS}
          disabled={readOnly}
        />
        <DealInterestButton
          propertyId={propertyId}
          viewerRole={viewerRole}
          className={MEMO_PANEL_ACTION_CLASS}
          disabled={readOnly}
        />
        <div className="relative w-full overflow-visible">
          <details
            ref={moreActionsRef}
            className="group w-full overflow-visible"
            onToggle={(e) => setMoreOpen(e.currentTarget.open)}
          >
            <summary
              aria-expanded={moreOpen}
              className={cn(
                "flex w-full cursor-pointer list-none items-center justify-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-stone-900 transition-all duration-150 hover:scale-[1.01] hover:bg-white hover:shadow-sm active:scale-[0.99] motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20",
                "[&::-webkit-details-marker]:hidden",
              )}
            >
              More actions
              <svg
                className="h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200 group-open:rotate-180"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
          </details>
          {typeof document !== "undefined" &&
            moreOpen &&
            moreMenuBox != null &&
            createPortal(
              <div
                ref={moreMenuPortalRef}
                className="pointer-events-auto relative"
                style={moreMenuBox}
              >
                <div
                  className="pointer-events-none absolute -top-1.5 right-8 z-10 h-3 w-3 rotate-45 border-l border-t border-stone-200/80 bg-white/95"
                  aria-hidden
                />
                <div
                  className="w-64 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-1.5 text-stone-900 shadow-[0_24px_70px_rgba(15,23,42,0.22)] backdrop-blur-md"
                  role="menu"
                >
                  <DownloadDealReportButton
                    payload={dealReportPayload}
                    addressForFilename={addressForFilename}
                    proLocked={proLocked}
                    menuLayout
                  />
                  {!readOnly ? (
                    <>
                      <div className="my-1 h-px bg-stone-200/70" />
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:ring-inset"
                        disabled={deletePending}
                        onClick={() => setDeleteConfirmOpen(true)}
                      >
                        Delete property
                      </button>
                    </>
                  ) : null}
                </div>
              </div>,
              document.body,
            )}
        </div>
      </div>
    </div>
  );
}
