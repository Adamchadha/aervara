export type DealConciergeRequesterRole =
  | "developer"
  | "investor"
  | "broker"
  | "partner"
  | "acquisition_team"
  | "other";

export type DealConciergeConnectionType = "call" | "meeting" | "intro";

export type DealConciergeUrgency = "low" | "standard" | "high";

export type DealConciergeRequestStatus =
  | "new"
  | "reviewed"
  | "in_progress"
  | "complete"
  | "closed";
