import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  STRIPE_CHECKOUT_DISABLED_MESSAGE,
  missingStripeCheckoutEnv,
  stripePriceElite,
  stripePricePro,
} from "@/lib/stripe-config";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

type Body = { plan?: "pro" | "elite" };

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan === "elite" ? "elite" : "pro";
  const checkoutMissing = missingStripeCheckoutEnv(plan);
  if (checkoutMissing.length > 0) {
    return NextResponse.json(
      {
        error: STRIPE_CHECKOUT_DISABLED_MESSAGE,
        detail: `Set the following in your environment: ${checkoutMissing.map((m) => m.envVar).join(", ") || "see server logs"}.`,
        missing: checkoutMissing,
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

  const priceId = plan === "elite" ? stripePriceElite()! : stripePricePro()!;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const existingCustomer =
    profile &&
    typeof (profile as { stripe_customer_id?: string }).stripe_customer_id ===
      "string"
      ? (profile as { stripe_customer_id: string }).stripe_customer_id
      : null;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existingCustomer ?? undefined,
    customer_email: existingCustomer ? undefined : user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin.replace(/\/$/, "")}/dashboard?checkout=success`,
    cancel_url: `${origin.replace(/\/$/, "")}/pricing`,
    client_reference_id: user.id,
    metadata: {
      supabase_user_id: user.id,
      billing_plan: plan,
    },
    subscription_data: {
      metadata: {
        supabase_user_id: user.id,
        billing_plan: plan,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Checkout session missing redirect URL" },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
