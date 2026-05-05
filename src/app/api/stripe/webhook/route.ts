import { NextResponse } from "next/server";
import Stripe from "stripe";
import { subscriptionIsPaid } from "@/lib/billing-access";
import { billingTierForPriceId } from "@/lib/stripe-config";
import { getStripe } from "@/lib/stripe-server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function subscriptionStatusString(status: Stripe.Subscription.Status): string {
  return status;
}

function tierFromSubscription(sub: Stripe.Subscription): "pro" | "elite" {
  const item = sub.items.data[0];
  const priceId = item?.price?.id ?? null;
  return billingTierForPriceId(priceId);
}

async function resolveUserId(
  admin: ReturnType<typeof createServiceRoleClient>,
  sub: Stripe.Subscription,
): Promise<string | null> {
  const meta = sub.metadata?.supabase_user_id;
  if (typeof meta === "string" && meta.trim() !== "") return meta.trim();

  const customerId =
    typeof sub.customer === "string"
      ? sub.customer
      : (sub.customer as Stripe.Customer | null)?.id ?? null;
  if (!customerId) return null;

  const { data } = await admin
    .from("user_profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data && typeof (data as { user_id: string }).user_id === "string"
    ? (data as { user_id: string }).user_id
    : null;
}

async function applySubscription(
  admin: ReturnType<typeof createServiceRoleClient>,
  userId: string,
  customerId: string,
  sub: Stripe.Subscription,
) {
  const paid = subscriptionIsPaid(sub.status);
  const tier = tierFromSubscription(sub);
  const { error } = await admin.from("user_profiles").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      subscription_status: subscriptionStatusString(sub.status),
      membership_tier: paid ? tier : "free",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[stripe webhook] profile upsert failed", error.message);
    throw error;
  }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET not configured" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "verify failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createServiceRoleClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          (session.metadata?.supabase_user_id as string | undefined) ??
          (session.client_reference_id as string | undefined);
        const subRef = session.subscription;
        const subId =
          typeof subRef === "string"
            ? subRef
            : subRef && typeof subRef === "object" && "id" in subRef
              ? (subRef as { id: string }).id
              : null;
        const customerRef = session.customer;
        const customerId =
          typeof customerRef === "string"
            ? customerRef
            : customerRef &&
                typeof customerRef === "object" &&
                "id" in customerRef
              ? (customerRef as { id: string }).id
              : null;
        if (!userId || !subId || !customerId) break;

        const sub = await getStripe().subscriptions.retrieve(subId);
        await applySubscription(admin, userId, customerId, sub);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(admin, sub);
        const customerId =
          typeof sub.customer === "string"
            ? sub.customer
            : (sub.customer as Stripe.Customer).id;
        if (!userId || !customerId) break;
        await applySubscription(admin, userId, customerId, sub);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(admin, sub);
        if (!userId) break;
        const { error } = await admin
          .from("user_profiles")
          .update({
            subscription_status: "canceled",
            membership_tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        if (error) {
          console.error("[stripe webhook] cancel update failed", error.message);
          throw error;
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
