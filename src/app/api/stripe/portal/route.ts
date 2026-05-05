import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  STRIPE_CHECKOUT_DISABLED_MESSAGE,
  missingStripePortalEnv,
} from "@/lib/stripe-config";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const portalMissing = missingStripePortalEnv();
  if (portalMissing.length > 0) {
    return NextResponse.json(
      {
        error: STRIPE_CHECKOUT_DISABLED_MESSAGE,
        detail: `Set: ${portalMissing.map((m) => m.envVar).join(", ")}.`,
        missing: portalMissing,
      },
      { status: 503 },
    );
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      {
        error: STRIPE_CHECKOUT_DISABLED_MESSAGE,
        detail:
          "Stripe client failed to initialize. Confirm STRIPE_SECRET_KEY is a valid secret key (sk_test_… or sk_live_…).",
      },
      { status: 503 },
    );
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) {
    return NextResponse.json(
      { error: "No billing profile found. Subscribe from Pricing first." },
      { status: 400 },
    );
  }

  const customerId = (profile as { stripe_customer_id: string | null })
    .stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file." },
      { status: 400 },
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin.replace(/\/$/, "")}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
