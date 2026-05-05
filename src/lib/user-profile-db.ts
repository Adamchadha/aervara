import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { USER_PROFILES_SELECT_COLUMNS } from "@/lib/user-profiles-columns";
import type { ContactPreference, UserProfileRow } from "@/types/user-profile";
import {
  parseBillingTier,
  parseContactPreference,
  parseInviteStatus,
  parseProfileVisibility,
  parseVerificationStatus,
  parseUserProfessionalRole,
} from "@/types/user-profile";

const CONTACT_PREFS: readonly ContactPreference[] = [
  "email",
  "linkedin",
  "website",
  "in_app",
  "no_preference",
];

function strCol(raw: Record<string, unknown>, key: string): string | null {
  const v = raw[key];
  if (v == null) return null;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? null : t;
  }
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function boolCol(
  raw: Record<string, unknown>,
  key: string,
  whenNull: boolean,
): boolean {
  const v = raw[key];
  if (typeof v === "boolean") return v;
  if (v == null) return whenNull;
  return whenNull;
}

function isoCol(raw: Record<string, unknown>, key: string): string | null {
  const v = raw[key];
  if (v == null) return null;
  if (typeof v === "string" && v.trim() !== "") return v;
  return null;
}

/**
 * Coerce a Supabase row into `UserProfileRow` so UI never sees invalid enums
 * or null timestamps where the contract expects defined values.
 */
export function normalizeUserProfileRow(
  raw: Record<string, unknown> | null | undefined,
): UserProfileRow | null {
  if (!raw || typeof raw.user_id !== "string") {
    return null;
  }

  const now = new Date().toISOString();
  const created = isoCol(raw, "created_at") ?? now;
  const updated = isoCol(raw, "updated_at") ?? now;

  return {
    user_id: raw.user_id,
    email: strCol(raw, "email"),
    role: parseUserProfessionalRole(raw.role),
    display_name: strCol(raw, "display_name"),
    full_name: strCol(raw, "full_name"),
    company: strCol(raw, "company"),
    title: strCol(raw, "title"),
    market: strCol(raw, "market"),
    target_cities: strCol(raw, "target_cities"),
    deal_size_range: strCol(raw, "deal_size_range"),
    asset_interest: strCol(raw, "asset_interest"),
    asset_type_interest: strCol(raw, "asset_type_interest"),
    bio: strCol(raw, "bio"),
    website: strCol(raw, "website"),
    linkedin: strCol(raw, "linkedin"),
    contact_preference: parseContactPreference(raw.contact_preference),
    membership_tier:
      raw.membership_tier == null ? null : parseBillingTier(raw.membership_tier),
    stripe_customer_id: strCol(raw, "stripe_customer_id"),
    subscription_status: strCol(raw, "subscription_status"),
    is_approved:
      raw.is_approved == null
        ? null
        : Boolean(raw.is_approved),
    profile_visibility:
      raw.profile_visibility == null
        ? null
        : parseProfileVisibility(raw.profile_visibility),
    invite_status: parseInviteStatus(strCol(raw, "invite_status")),
    access_status: parseInviteStatus(
      strCol(raw, "access_status") ?? strCol(raw, "invite_status"),
    ),
    network_access_notes: strCol(raw, "network_access_notes"),
    example_projects: strCol(raw, "example_projects"),
    project_notes: strCol(raw, "project_notes"),
    brochure_link: strCol(raw, "brochure_link"),
    deck_link: strCol(raw, "deck_link"),
    materials_pdf_link: strCol(raw, "materials_pdf_link"),
    floor_plan_placeholder: strCol(raw, "floor_plan_placeholder"),
    concept_file_placeholder: strCol(raw, "concept_file_placeholder"),
    currently_seeking: strCol(raw, "currently_seeking"),
    open_to_introductions: boolCol(raw, "open_to_introductions", true),
    looking_for: strCol(raw, "looking_for"),
    preferred_contact_method: strCol(raw, "preferred_contact_method"),
    available_for_in_person_meetings: boolCol(
      raw,
      "available_for_in_person_meetings",
      false,
    ),
    preferred_meeting_cities: strCol(raw, "preferred_meeting_cities"),
    phone: strCol(raw, "phone"),
    intro_notes: strCol(raw, "intro_notes"),
    avatar_url: strCol(raw, "avatar_url"),
    verification_status: parseVerificationStatus(
      strCol(raw, "verification_status"),
    ),
    onboarding_skipped: boolCol(raw, "onboarding_skipped", false),
    onboarding_completed_at: isoCol(raw, "onboarding_completed_at"),
    created_at: created,
    updated_at: updated,
  };
}

export function isUserProfilesTableMissing(error: {
  message?: string;
} | null): boolean {
  const m = error?.message ?? "";
  return (
    m.includes("Could not find the table") ||
    m.includes("schema cache") ||
    m.includes("relation \"public.user_profiles\" does not exist") ||
    m.includes("relation 'public.user_profiles' does not exist")
  );
}

/**
 * Load the signed-in user's profile row, or null if missing / table absent.
 */
export async function fetchUserProfileRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ row: UserProfileRow | null; tableMissing: boolean }> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select(USER_PROFILES_SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isUserProfilesTableMissing(error)) {
    return { row: null, tableMissing: true };
  }
  if (error) {
    throw new Error(error.message);
  }
  return {
    row: normalizeUserProfileRow(
      data as Record<string, unknown> | null | undefined,
    ),
    tableMissing: false,
  };
}

type Meta = Record<string, unknown>;

/**
 * Prefill profile form from JWT metadata when DB row is thin.
 * Legacy keys (`firm_name`, `website_url`, etc.) are metadata-only fallbacks — not DB columns.
 */
export function profileDefaultsFromMetadata(user: User): Partial<UserProfileRow> {
  const m = user.user_metadata as Meta;
  const str = (k: string) =>
    typeof m[k] === "string" && (m[k] as string).trim() !== ""
      ? (m[k] as string).trim()
      : null;

  const legacyMarket =
    [str("city_region"), str("market_focus")].filter(Boolean).join(" · ") || null;

  const billingMeta = str("membership_tier");
  const visibilityMeta = str("profile_visibility");

  return {
    display_name: str("display_name"),
    full_name: str("full_name"),
    role: parseUserProfessionalRole(str("role")),
    company: str("company") ?? str("firm_name"),
    title: str("title"),
    market: str("market") ?? legacyMarket,
    target_cities: str("target_cities"),
    deal_size_range: str("deal_size_range"),
    asset_interest: str("asset_interest"),
    asset_type_interest: str("asset_type_interest"),
    bio: str("bio") ?? str("notes"),
    website: str("website") ?? str("website_url"),
    linkedin: str("linkedin") ?? str("linkedin_url"),
    membership_tier:
      billingMeta != null ? parseBillingTier(billingMeta) : undefined,
    profile_visibility:
      visibilityMeta != null
        ? parseProfileVisibility(visibilityMeta)
        : undefined,
    invite_status: parseInviteStatus(str("invite_status")),
    access_status: parseInviteStatus(str("access_status")),
    network_access_notes: str("network_access_notes"),
    example_projects: str("example_projects"),
    project_notes: str("project_notes"),
    brochure_link: str("brochure_link"),
    deck_link: str("deck_link"),
    materials_pdf_link: str("materials_pdf_link"),
    floor_plan_placeholder: str("floor_plan_placeholder"),
    concept_file_placeholder: str("concept_file_placeholder"),
    currently_seeking: str("currently_seeking"),
    looking_for: str("looking_for"),
    preferred_contact_method: str("preferred_contact_method"),
    preferred_meeting_cities: str("preferred_meeting_cities"),
    phone: str("phone"),
    intro_notes: str("intro_notes"),
  };
}

export function mergeProfileWithMetadata(
  row: UserProfileRow | null,
  user: User,
): UserProfileRow | null {
  const meta = profileDefaultsFromMetadata(user);
  if (!row) {
    return null;
  }
  return {
    ...row,
    email: row.email ?? user.email ?? null,
    display_name: row.display_name ?? meta.display_name ?? null,
    full_name: row.full_name ?? meta.full_name ?? null,
    role:
      parseUserProfessionalRole(row.role) ??
      parseUserProfessionalRole(meta.role) ??
      null,
    company: row.company ?? meta.company ?? null,
    title: row.title ?? meta.title ?? null,
    market: row.market ?? meta.market ?? null,
    target_cities: row.target_cities ?? meta.target_cities ?? null,
    deal_size_range: row.deal_size_range ?? meta.deal_size_range ?? null,
    asset_interest: row.asset_interest ?? meta.asset_interest ?? null,
    asset_type_interest:
      row.asset_type_interest ?? meta.asset_type_interest ?? null,
    bio: row.bio ?? meta.bio ?? null,
    website: row.website ?? meta.website ?? null,
    linkedin: row.linkedin ?? meta.linkedin ?? null,
    membership_tier: parseBillingTier(
      row.membership_tier ?? user.user_metadata?.membership_tier,
    ),
    profile_visibility: parseProfileVisibility(
      row.profile_visibility ?? user.user_metadata?.profile_visibility,
    ),
    is_approved:
      row.is_approved ??
      (typeof user.user_metadata?.is_approved === "boolean"
        ? user.user_metadata.is_approved
        : false),
    invite_status:
      row.invite_status ??
      parseInviteStatus(
        typeof user.user_metadata?.invite_status === "string"
          ? user.user_metadata.invite_status
          : null,
      ),
    access_status:
      row.access_status ??
      parseInviteStatus(
        typeof user.user_metadata?.access_status === "string"
          ? user.user_metadata.access_status
          : row.invite_status,
      ),
    network_access_notes:
      row.network_access_notes ??
      (typeof user.user_metadata?.network_access_notes === "string"
        ? user.user_metadata.network_access_notes
        : null),
    example_projects:
      row.example_projects ??
      (typeof user.user_metadata?.example_projects === "string"
        ? user.user_metadata.example_projects
        : null),
    project_notes:
      row.project_notes ??
      (typeof user.user_metadata?.project_notes === "string"
        ? user.user_metadata.project_notes
        : null),
    brochure_link:
      row.brochure_link ??
      (typeof user.user_metadata?.brochure_link === "string"
        ? user.user_metadata.brochure_link
        : null),
    deck_link:
      row.deck_link ??
      (typeof user.user_metadata?.deck_link === "string"
        ? user.user_metadata.deck_link
        : null),
    materials_pdf_link:
      row.materials_pdf_link ??
      (typeof user.user_metadata?.materials_pdf_link === "string"
        ? user.user_metadata.materials_pdf_link
        : null),
    floor_plan_placeholder:
      row.floor_plan_placeholder ??
      (typeof user.user_metadata?.floor_plan_placeholder === "string"
        ? user.user_metadata.floor_plan_placeholder
        : null),
    concept_file_placeholder:
      row.concept_file_placeholder ??
      (typeof user.user_metadata?.concept_file_placeholder === "string"
        ? user.user_metadata.concept_file_placeholder
        : null),
    currently_seeking:
      row.currently_seeking ??
      (typeof user.user_metadata?.currently_seeking === "string"
        ? user.user_metadata.currently_seeking
        : null),
    open_to_introductions:
      row.open_to_introductions ??
      (typeof user.user_metadata?.open_to_introductions === "boolean"
        ? user.user_metadata.open_to_introductions
        : true),
    looking_for: row.looking_for ?? meta.looking_for ?? null,
    preferred_contact_method:
      row.preferred_contact_method ??
      meta.preferred_contact_method ??
      row.contact_preference ??
      null,
    available_for_in_person_meetings:
      row.available_for_in_person_meetings ??
      (typeof user.user_metadata?.available_for_in_person_meetings === "boolean"
        ? user.user_metadata.available_for_in_person_meetings
        : false),
    preferred_meeting_cities:
      row.preferred_meeting_cities ?? meta.preferred_meeting_cities ?? null,
    phone: row.phone ?? meta.phone ?? null,
    intro_notes: row.intro_notes ?? meta.intro_notes ?? null,
  };
}

/** Role for UI: DB + metadata merge (no table required for metadata-only users). */
export async function getEffectiveUserRole(
  supabase: SupabaseClient,
  user: User,
): Promise<string | null> {
  try {
    const { row } = await fetchUserProfileRow(supabase, user.id);
    if (row) {
      const merged = mergeProfileWithMetadata(row, user);
      return (
        parseUserProfessionalRole(merged?.role) ??
        parseUserProfessionalRole(user.user_metadata?.role) ??
        null
      );
    }
  } catch {
    // Schema drift or transient errors — dashboard should still render.
  }
  return parseUserProfessionalRole(user.user_metadata?.role) ?? null;
}

export function profileFormSeed(row: UserProfileRow | null, user: User): UserProfileRow {
  const merged = row ? mergeProfileWithMetadata(row, user)! : null;
  const meta = profileDefaultsFromMetadata(user);
  const now = new Date().toISOString();

  return {
    user_id: user.id,
    email: merged?.email ?? user.email ?? null,
    display_name: merged?.display_name ?? meta.display_name ?? null,
    full_name: merged?.full_name ?? meta.full_name ?? null,
    role:
      parseUserProfessionalRole(merged?.role) ??
      parseUserProfessionalRole(meta.role) ??
      "developer",
    company: merged?.company ?? meta.company ?? null,
    title: merged?.title ?? meta.title ?? null,
    market: merged?.market ?? meta.market ?? null,
    target_cities: merged?.target_cities ?? meta.target_cities ?? null,
    deal_size_range: merged?.deal_size_range ?? meta.deal_size_range ?? null,
    asset_interest: merged?.asset_interest ?? meta.asset_interest ?? null,
    asset_type_interest:
      merged?.asset_type_interest ?? meta.asset_type_interest ?? null,
    bio: merged?.bio ?? meta.bio ?? null,
    website: merged?.website ?? meta.website ?? null,
    linkedin: merged?.linkedin ?? meta.linkedin ?? null,
    membership_tier:
      merged?.membership_tier ??
      parseBillingTier(user.user_metadata?.membership_tier),
    stripe_customer_id: merged?.stripe_customer_id ?? null,
    subscription_status: merged?.subscription_status ?? null,
    is_approved: merged?.is_approved ?? false,
    profile_visibility: merged?.profile_visibility ?? "public_within_network",
    invite_status: merged?.invite_status ?? null,
    access_status: merged?.access_status ?? merged?.invite_status ?? "pending",
    network_access_notes: merged?.network_access_notes ?? null,
    example_projects: merged?.example_projects ?? null,
    project_notes: merged?.project_notes ?? null,
    brochure_link: merged?.brochure_link ?? null,
    deck_link: merged?.deck_link ?? null,
    materials_pdf_link: merged?.materials_pdf_link ?? null,
    floor_plan_placeholder: merged?.floor_plan_placeholder ?? null,
    concept_file_placeholder: merged?.concept_file_placeholder ?? null,
    currently_seeking: merged?.currently_seeking ?? null,
    open_to_introductions: merged?.open_to_introductions ?? true,
    looking_for: merged?.looking_for ?? meta.looking_for ?? null,
    preferred_contact_method:
      merged?.preferred_contact_method ??
      meta.preferred_contact_method ??
      merged?.contact_preference ??
      "email",
    available_for_in_person_meetings:
      merged?.available_for_in_person_meetings ?? false,
    preferred_meeting_cities:
      merged?.preferred_meeting_cities ?? meta.preferred_meeting_cities ?? null,
    phone: merged?.phone ?? meta.phone ?? null,
    intro_notes: merged?.intro_notes ?? meta.intro_notes ?? null,
    avatar_url: merged?.avatar_url ?? null,
    verification_status:
      merged?.verification_status ??
      parseVerificationStatus(user.user_metadata?.verification_status),
    contact_preference:
      merged?.contact_preference &&
      CONTACT_PREFS.includes(merged.contact_preference as ContactPreference)
        ? (merged.contact_preference as ContactPreference)
        : "email",
    onboarding_skipped: merged?.onboarding_skipped ?? false,
    onboarding_completed_at: merged?.onboarding_completed_at ?? null,
    created_at: merged?.created_at ?? now,
    updated_at: merged?.updated_at ?? now,
  };
}
