export type IntroductionTargetRole =
  | "developer"
  | "investor"
  | "broker"
  | "partner"
  | "acquisition_team";

export type IntroductionPurpose =
  | "explore_acquisition"
  | "explore_investment"
  | "explore_brokerage_marketing"
  | "discuss_partnership"
  | "general_inquiry";

export type IntroductionRequestStatus =
  | "new"
  | "reviewed"
  | "connected"
  | "closed";

/** Row shape for property Site Room lists (from `property_introduction_requests`). */
export type IntroductionRequestRow = {
  id: string;
  target_role: IntroductionTargetRole;
  purpose: IntroductionPurpose;
  message: string;
  status: IntroductionRequestStatus;
  created_at: string;
};
