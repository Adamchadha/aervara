/** Recurring price IDs from Stripe Dashboard (Products → Prices). */
export function stripePricePro(): string | undefined {
  return process.env.STRIPE_PRICE_PRO_MONTHLY?.trim() || undefined;
}

export function stripePriceElite(): string | undefined {
  return process.env.STRIPE_PRICE_ELITE_MONTHLY?.trim() || undefined;
}

export type StripeEnvVarName =
  | "STRIPE_SECRET_KEY"
  | "STRIPE_PRICE_PRO_MONTHLY"
  | "STRIPE_PRICE_ELITE_MONTHLY"
  | "STRIPE_WEBHOOK_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SITE_URL";

export type StripeConfigIssue = {
  envVar: StripeEnvVarName;
  /** Short label for logs and UI. */
  label: string;
  /** Why this is needed. */
  reason: string;
};

function trimEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

/** Variables required for `POST /api/stripe/checkout` for the given plan. */
export function missingStripeCheckoutEnv(plan: "pro" | "elite"): StripeConfigIssue[] {
  const issues: StripeConfigIssue[] = [];
  if (!trimEnv("STRIPE_SECRET_KEY")) {
    issues.push({
      envVar: "STRIPE_SECRET_KEY",
      label: "Stripe secret key",
      reason: "Required to create Checkout sessions and call the Stripe API.",
    });
  }
  if (plan === "pro" && !stripePricePro()) {
    issues.push({
      envVar: "STRIPE_PRICE_PRO_MONTHLY",
      label: "Pro subscription price",
      reason: "Recurring Price ID for the Pro plan (Stripe Dashboard → Products → Prices).",
    });
  }
  if (plan === "elite" && !stripePriceElite()) {
    issues.push({
      envVar: "STRIPE_PRICE_ELITE_MONTHLY",
      label: "Elite subscription price",
      reason: "Recurring Price ID for the Elite plan (Stripe Dashboard → Products → Prices).",
    });
  }
  return issues;
}

/** Variables required for `POST /api/stripe/portal` (Billing Portal session). */
export function missingStripePortalEnv(): StripeConfigIssue[] {
  const issues: StripeConfigIssue[] = [];
  if (!trimEnv("STRIPE_SECRET_KEY")) {
    issues.push({
      envVar: "STRIPE_SECRET_KEY",
      label: "Stripe secret key",
      reason: "Required to create Billing Portal sessions.",
    });
  }
  return issues;
}

/**
 * Environment variables required for webhooks to update `user_profiles` after payment.
 * Checkout redirect can succeed without these; subscription status in the app will not update.
 */
export function missingStripeWebhookEnv(): StripeConfigIssue[] {
  const issues: StripeConfigIssue[] = [];
  if (!trimEnv("STRIPE_WEBHOOK_SECRET")) {
    issues.push({
      envVar: "STRIPE_WEBHOOK_SECRET",
      label: "Webhook signing secret",
      reason:
        "Required to verify `stripe-signature` on POST /api/stripe/webhook (Stripe CLI or Dashboard endpoint).",
    });
  }
  if (!trimEnv("STRIPE_SECRET_KEY")) {
    issues.push({
      envVar: "STRIPE_SECRET_KEY",
      label: "Stripe secret key",
      reason: "Required to retrieve subscriptions inside the webhook handler.",
    });
  }
  if (!trimEnv("NEXT_PUBLIC_SUPABASE_URL")) {
    issues.push({
      envVar: "NEXT_PUBLIC_SUPABASE_URL",
      label: "Supabase project URL",
      reason: "Required for the service-role client used to upsert billing fields on user_profiles.",
    });
  }
  if (!trimEnv("SUPABASE_SERVICE_ROLE_KEY")) {
    issues.push({
      envVar: "SUPABASE_SERVICE_ROLE_KEY",
      label: "Supabase service role key",
      reason: "Webhooks bypass RLS; the service role key must be set server-side only.",
    });
  }
  return issues;
}

/** Optional but recommended when `Origin` is missing (e.g. some server-to-server calls). */
export function missingStripeSiteUrlWarning(): StripeConfigIssue | null {
  if (trimEnv("NEXT_PUBLIC_SITE_URL")) return null;
  return {
    envVar: "NEXT_PUBLIC_SITE_URL",
    label: "Public site URL",
    reason:
      "Used as fallback for Checkout success/cancel and Portal return URLs when the `Origin` header is absent. Set in production.",
  };
}

/** Human-readable report for logs, support, or a health check response. */
export function formatStripeConfigReport(): string {
  const lines: string[] = [];
  for (const plan of ["pro", "elite"] as const) {
    const checkoutMissing = missingStripeCheckoutEnv(plan);
    if (checkoutMissing.length === 0) {
      lines.push(`Checkout (${plan}): ready (required env vars present).`);
    } else {
      lines.push(`Checkout (${plan}): blocked —`);
      checkoutMissing.forEach((i) => {
        lines.push(`  - ${i.envVar}: ${i.reason}`);
      });
    }
  }
  const site = missingStripeSiteUrlWarning();
  if (site) {
    lines.push(`Warning: ${site.envVar} — ${site.reason}`);
  }
  const portalMissing = missingStripePortalEnv();
  if (portalMissing.length === 0) {
    lines.push("Billing Portal: required env vars present.");
  } else {
    lines.push("Billing Portal: blocked —");
    portalMissing.forEach((i) => {
      lines.push(`  - ${i.envVar}: ${i.reason}`);
    });
  }
  const whMissing = missingStripeWebhookEnv();
  if (whMissing.length === 0) {
    lines.push("Webhook → database sync: required env vars present.");
  } else {
    lines.push("Webhook → database sync: incomplete —");
    whMissing.forEach((i) => {
      lines.push(`  - ${i.envVar}: ${i.reason}`);
    });
  }
  return lines.join("\n");
}

/** Server-side Stripe API key (Checkout + Portal + webhooks). */
export function stripeSecretKeyConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

/** Whether Checkout can run for this plan (secret key + recurring price ID). */
export function stripeCheckoutAvailable(plan: "pro" | "elite"): boolean {
  if (!stripeSecretKeyConfigured()) return false;
  return plan === "elite"
    ? Boolean(stripePriceElite())
    : Boolean(stripePricePro());
}

/** Pro and Elite Checkout both available (for global “configured” messaging). */
export function stripePaidPlansFullyConfigured(): boolean {
  return stripeCheckoutAvailable("pro") && stripeCheckoutAvailable("elite");
}

export const STRIPE_CHECKOUT_DISABLED_MESSAGE =
  "Checkout is not configured in this environment yet.";

export function billingTierForPriceId(priceId: string | null | undefined): "pro" | "elite" {
  const elite = stripePriceElite();
  if (elite && priceId === elite) return "elite";
  return "pro";
}
