"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { cn } from "@/lib/utils";
import { downloadDealReportPdf } from "@/lib/deal-report-pdf";
import type { DealReportPayload } from "@/types/deal-report-payload";

function filenameFromAddress(address: string): string {
  const base = address
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return base.length ? base : "property";
}

type DownloadDealReportButtonProps = {
  payload: DealReportPayload;
  addressForFilename: string;
  /** When true, show access CTA instead of generating a PDF (gated feature). */
  proLocked?: boolean;
  /** Full-width menu row (e.g. “More actions” dropdown). */
  menuLayout?: boolean;
};

export function DownloadDealReportButton({
  payload,
  addressForFilename,
  proLocked = false,
  menuLayout = false,
}: DownloadDealReportButtonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = useCallback(() => {
    setBusy(true);
    try {
      const slug = filenameFromAddress(addressForFilename);
      downloadDealReportPdf(payload, `Aervara-Deal-Report-${slug}.pdf`);
    } finally {
      setBusy(false);
    }
  }, [addressForFilename, payload]);

  const menuItemClass =
    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-stone-900 transition hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/10 focus-visible:ring-inset";

  if (proLocked) {
    const label = "Deal report PDF — Request Full Access";
    if (menuLayout) {
      return (
        <RequestFullAccessLink className={menuItemClass}>
          <span>Download deal report</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">
            Full access
          </span>
        </RequestFullAccessLink>
      );
    }
    return (
      <Button variant="secondary" asChild>
        <RequestFullAccessLink>{label}</RequestFullAccessLink>
      </Button>
    );
  }

  if (menuLayout) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className={cn(menuItemClass, busy && "pointer-events-none opacity-60")}
      >
        <span>{busy ? "Preparing…" : "Download deal report"}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">PDF</span>
      </button>
    );
  }

  return (
    <Button type="button" variant="secondary" disabled={busy} onClick={handleClick}>
      {busy ? "Preparing…" : "Download Deal Report"}
    </Button>
  );
}
