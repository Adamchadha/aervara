export type DealInterestIntent = "acquire" | "invest" | "broker" | "partner";

export type PropertyDealInterestRow = {
  id: string;
  property_id: string;
  user_id: string;
  user_role: string | null;
  intent: DealInterestIntent;
  message: string | null;
  created_at: string;
};
