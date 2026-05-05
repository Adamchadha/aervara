import type { SupabaseClient } from "@supabase/supabase-js";
import type { DealActivityEventType } from "@/types/deal-activity";

export async function recordDealActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    propertyId: string;
    eventType: DealActivityEventType;
    detail?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.from("property_deal_activity_events").insert({
    property_id: params.propertyId,
    user_id: params.userId,
    event_type: params.eventType,
    detail: params.detail ?? null,
    metadata: params.metadata ?? {},
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
