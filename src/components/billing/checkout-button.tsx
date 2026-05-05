"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StripeConfigIssue } from "@/lib/stripe-config";
import { STRIPE_CHECKOUT_DISABLED_MESSAGE } from "@/lib/stripe-config";
import { cn } from "@/lib/utils";

type Plan = "pro" | "elite";

export function CheckoutButton({
  plan,
  label,
  className,
  variant = "primary",
  checkoutEnabled = true,
}: {
  plan: Plan;
  label: string;
  className?: string;
  variant?: "primary" | "secondary";
  /** When false, button is disabled and checkout is not attempted. */
  checkoutEnabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingEnv, setMissingEnv] = useState<StripeConfigIssue[] | null>(null);

  async function startCheckout() {
    setError(null);
    setMissingEnv(null);
    if (!checkoutEnabled) return;
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
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
        setError(
          [
            data.error ??
              (res.status === 503
                ? STRIPE_CHECKOUT_DISABLED_MESSAGE
                : "Could not start checkout. Try again later."),
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
      setError("Could not reach checkout. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <Button
        type="button"
        variant={variant === "primary" ? "primary" : "secondary"}
        disabled={pending || !checkoutEnabled}
        className={cn("rounded-xl", checkoutEnabled ? "" : "opacity-60")}
        onClick={() => void startCheckout()}
        aria-describedby={error ? `checkout-error-${plan}` : undefined}
      >
        {pending ? "Redirecting…" : label}
      </Button>
      {error ? (
        <div
          id={`checkout-error-${plan}`}
          className="mt-2 text-xs leading-relaxed text-red-700/90"
          role="alert"
        >
          <p>{error}</p>
          {missingEnv?.length ? (
            <ul className="mt-2 list-inside list-disc space-y-1 text-[11px] text-red-800/90">
              {missingEnv.map((m) => (
                <li key={m.envVar}>
                  <span className="font-mono">{m.envVar}</span>
                  <span className="text-red-700/85"> — {m.reason}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
