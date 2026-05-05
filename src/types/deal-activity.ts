export type DealActivityEventType = "site_visit_planned" | "notes_added";

export type PropertyDealActivityRow = {
  id: string;
  property_id: string;
  user_id: string;
  event_type: DealActivityEventType;
  detail: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};
