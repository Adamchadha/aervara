"use client";

import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StripeConfigIssue } from "@/lib/stripe-config";
import { STRIPE_CHECKOUT_DISABLED_MESSAGE } from "@/lib/stripe-config";
import type { BillingTier } from "@/types/user-profile";

type StripePlanActionsProps = {
  billingTier: BillingTier;
  stripeCustomerId: string | null;
  /** Hide the access CTA (platform admin). */
  suppressUpgradeLinks?: boolean;
};

export function StripePlanActions({
  billingTier,
  stripeCustomerId,
  suppressUpgradeLinks = false,
}: StripePlanActionsProps) {
  const [busy, setBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [missingEnv, setMissingEnv] = useState<StripeConfigIssue[] | null>(null);

  async function openPortal() {
    setPortalError(null);
    setMissingEnv(null);
    setBusy(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        detail?: string;
        missing?: StripeConfigIssue[];
      };
      if (!res.ok) {
        setMissingEnv(
          Array.isArray(data.missing) && data.missing.length > 0 ? data.missing : null,
        );
        setPortalError(
          [
            data.error ??
              (res.status === 503
                ? STRIPE_CHECKOUT_DISABLED_MESSAGE
                : "Could not open billing portal."),
            data.detail?.trim(),
          ]
            .filter(Boolean)
            .join(" "),
        );
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setPortalError(
        "Could not reach billing. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {portalError ? (
        <div
          className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-xs text-red-900"
          role="alert"
        >
          <p>{portalError}</p>
          {missingEnv?.length ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] text-red-800/90">
              {missingEnv.map((m) => (
                <li key={m.envVar}>
                  <span className="font-mono">{m.envVar}</span>
                  <span className="text-red-800/80"> — {m.reason}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
      {!suppressUpgradeLinks ? (
        <Button variant="secondary" asChild className="rounded-xl text-sm">
          <RequestFullAccessLink>Request Full Access</RequestFullAccessLink>
        </Button>
      ) : null}
      {stripeCustomerId ? (
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          className="rounded-xl text-sm"
          onClick={() => void openPortal()}
        >
          {busy ? "Opening…" : "Manage billing"}
        </Button>
      ) : null}
      </div>
    </div>
  );
}
