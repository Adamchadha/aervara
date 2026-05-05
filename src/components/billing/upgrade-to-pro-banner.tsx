"use client";

import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpgradeToProModal } from "@/components/billing/upgrade-to-pro-modal";
import { cn } from "@/lib/utils";

type DevGateSnapshot = {
  isAdmin: boolean;
  hasProAccess: boolean;
  hasEliteAccess: boolean;
  membership_tier: string | null;
  role: string | null;
};

type UpgradeToProBannerProps = {
  variant?: "limit" | "default";
  className?: string;
  /** When true, render nothing (e.g. platform admin / full Pro access). */
  hidden?: boolean;
  /** Non-production: show merged gate flags under the banner. */
  devGateDebug?: DevGateSnapshot | null;
};

export function UpgradeToProBanner({
  variant = "default",
  className,
  hidden = false,
  devGateDebug,
}: UpgradeToProBannerProps) {
  const [open, setOpen] = useState(false);

  if (hidden) return null;

  const copy =
    variant === "limit"
      ? "You have reached the free limit of five properties. Access is limited on the free tier—request full access to add more parcels, import CSV, export PDFs, and use advanced analysis."
      : "Access is limited on the free tier. Request full access for unlimited parcels, CSV import, PDF reports, and advanced deal tools.";

  return (
    <>
      <UpgradeToProModal open={open} onClose={() => setOpen(false)} />
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-stone-200/60 bg-gradient-to-r from-stone-50/95 via-white to-stone-50/80 px-6 py-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03]",
          className,
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-relaxed text-neutral-800">
            {copy}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            <Button type="button" className="h-9 px-4 text-sm" onClick={() => setOpen(true)}>
              Learn more
            </Button>
            <Button variant="secondary" className="h-9 px-4 text-sm" asChild>
              <RequestFullAccessLink>Request Full Access</RequestFullAccessLink>
            </Button>
          </div>
        </div>
        {process.env.NEXT_PUBLIC_AERVARA_SHOW_GATE_DEBUG === "true" && devGateDebug ? (
          <p className="font-mono text-[9px] leading-relaxed text-violet-700/90">
            [gate debug] isAdmin={String(devGateDebug.isAdmin)} · hasProAccess=
            {String(devGateDebug.hasProAccess)} · hasEliteAccess=
            {String(devGateDebug.hasEliteAccess)} · membership_tier=
            {JSON.stringify(devGateDebug.membership_tier)} · role=
            {JSON.stringify(devGateDebug.role)}
          </p>
        ) : null}
      </div>
    </>
  );
}
