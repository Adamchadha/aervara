import { NextResponse } from "next/server";
import {
  formatStripeConfigReport,
  missingStripeCheckoutEnv,
  missingStripeSiteUrlWarning,
  missingStripeWebhookEnv,
  stripePaidPlansFullyConfigured,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

/**
 * Development-only: structured Stripe env validation (no secrets returned).
 * In production returns 404 so configuration shape is not exposed publicly.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const siteUrlWarning = missingStripeSiteUrlWarning();
  return NextResponse.json({
    stripePaidPlansFullyConfigured: stripePaidPlansFullyConfigured(),
    checkout: {
      pro: { ok: missingStripeCheckoutEnv("pro").length === 0 },
      elite: { ok: missingStripeCheckoutEnv("elite").length === 0 },
      missingPro: missingStripeCheckoutEnv("pro"),
      missingElite: missingStripeCheckoutEnv("elite"),
    },
    webhook: {
      ok: missingStripeWebhookEnv().length === 0,
      missing: missingStripeWebhookEnv(),
    },
    siteUrl: {
      configured: siteUrlWarning === null,
      warning: siteUrlWarning,
    },
    report: formatStripeConfigReport(),
  });
}
