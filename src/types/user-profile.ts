export type UserProfessionalRole =
  | "developer"
  | "investor"
  | "broker"
  | "acquisition"
  | "other";

/** How other members may reach you (stored as plain string). */
export type ContactPreference =
  | "email"
  | "linkedin"
  | "website"
  | "in_app"
  | "no_preference";

/**
 * Billing / product tier stored in `user_profiles.membership_tier` (Stripe + app gating).
 * Legacy values (`standard`, `curated`, …) are migrated in SQL to `free` / `pro` / `elite`.
 */
export type BillingTier = "free" | "pro" | "elite";

export type ProfileVisibility =
  | "public_within_network"
  | "private"
  | "limited";
export type InviteStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "unverified" | "verified";

/** Canonical billing tiers for `membership_tier`. */
export const BILLING_TIER_VALUES: readonly BillingTier[] = [
  "free",
  "pro",
  "elite",
];

export const PROFILE_VISIBILITY_VALUES: readonly ProfileVisibility[] = [
  "public_within_network",
  "private",
  "limited",
];

export const USER_PROFESSIONAL_ROLE_VALUES: readonly UserProfessionalRole[] = [
  "developer",
  "investor",
  "broker",
  "acquisition",
  "other",
];

export const CONTACT_PREFERENCE_VALUES: readonly ContactPreference[] = [
  "email",
  "linkedin",
  "website",
  "in_app",
  "no_preference",
];

export function parseBillingTier(value: unknown): BillingTier {
  if (typeof value !== "string") return "free";
  const normalized = value.trim().toLowerCase();
  return BILLING_TIER_VALUES.includes(normalized as BillingTier)
    ? (normalized as BillingTier)
    : "free";
}

export function parseProfileVisibility(value: unknown): ProfileVisibility {
  return typeof value === "string" &&
    PROFILE_VISIBILITY_VALUES.includes(value as ProfileVisibility)
    ? (value as ProfileVisibility)
    : "public_within_network";
}

export function parseUserProfessionalRole(
  value: unknown,
): UserProfessionalRole | null {
  return typeof value === "string" &&
    USER_PROFESSIONAL_ROLE_VALUES.includes(value as UserProfessionalRole)
    ? (value as UserProfessionalRole)
    : null;
}

export function parseContactPreference(value: unknown): ContactPreference | null {
  return typeof value === "string" &&
    CONTACT_PREFERENCE_VALUES.includes(value as ContactPreference)
    ? (value as ContactPreference)
    : null;
}

export function parseInviteStatus(value: unknown): InviteStatus {
  return value === "approved" || value === "rejected" ? value : "pending";
}

export function parseVerificationStatus(value: unknown): VerificationStatus {
  return value === "verified" ? "verified" : "unverified";
}

/**
 * Row from `public.user_profiles` — must match DB columns exactly
 * (see `supabase/migrations/20260420201000_user_profiles_canonical_standard.sql`,
 * `20260421120000_stripe_billing.sql`, and `USER_PROFILES_SELECT_COLUMNS`).
 */
export type UserProfileRow = {
  user_id: string;
  email: string | null;
  role: UserProfessionalRole | null;
  display_name: string | null;
  full_name: string | null;
  company: string | null;
  title: string | null;
  market: string | null;
  target_cities: string | null;
  deal_size_range: string | null;
  asset_interest: string | null;
  asset_type_interest: string | null;
  bio: string | null;
  website: string | null;
  linkedin: string | null;
  contact_preference: ContactPreference | null;
  /** Stripe product tier (`free` | `pro` | `elite`). Null = treat as `free` until merged. */
  membership_tier: BillingTier | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  /** Approval gate for access to protected routes/pages. */
  is_approved: boolean | null;
  /** Null when unset in DB — merged with JWT in `mergeProfileWithMetadata`. */
  profile_visibility: ProfileVisibility | null;
  invite_status: InviteStatus | null;
  /** Platform access pipeline (pending | approved | rejected). */
  access_status: InviteStatus | null;
  network_access_notes: string | null;
  example_projects: string | null;
  project_notes: string | null;
  brochure_link: string | null;
  deck_link: string | null;
  materials_pdf_link: string | null;
  floor_plan_placeholder: string | null;
  concept_file_placeholder: string | null;
  currently_seeking: string | null;
  open_to_introductions: boolean;
  looking_for: string | null;
  preferred_contact_method: string | null;
  available_for_in_person_meetings: boolean;
  preferred_meeting_cities: string | null;
  phone: string | null;
  intro_notes: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus | null;
  onboarding_skipped: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};
