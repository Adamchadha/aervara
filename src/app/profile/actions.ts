"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";
import {
  CONTACT_PREFERENCE_VALUES,
  PROFILE_VISIBILITY_VALUES,
  USER_PROFESSIONAL_ROLE_VALUES,
  parseInviteStatus,
  parseVerificationStatus,
  type ContactPreference,
  type ProfileVisibility,
  type UserProfessionalRole,
} from "@/types/user-profile";

const ROLES = USER_PROFESSIONAL_ROLE_VALUES;
const CONTACT = CONTACT_PREFERENCE_VALUES;
const PROFILE_VISIBILITIES = PROFILE_VISIBILITY_VALUES;

function trim(s: FormDataEntryValue | null, max: number): string | null {
  if (s == null || typeof s !== "string") return null;
  const t = s.trim();
  if (t === "") return null;
  return t.length > max ? t.slice(0, max) : t;
}

function toBool(v: FormDataEntryValue | null): boolean {
  if (typeof v !== "string") return false;
  return v === "on" || v === "true" || v === "1";
}

function optionalHttpUrl(
  s: FormDataEntryValue | null,
  label: string,
): { ok: true; value: string | null } | { ok: false; error: string } {
  const t = trim(s, 2048);
  if (t == null) return { ok: true, value: null };
  if (!/^https?:\/\//i.test(t)) {
    return { ok: false, error: `${label} must start with http:// or https://` };
  }
  return { ok: true, value: t };
}

export type ProfileActionState = {
  error: string | null;
  success?: boolean;
};

export async function saveUserProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const roleRaw = trim(formData.get("role"), 32);
  if (!roleRaw || !ROLES.includes(roleRaw as UserProfessionalRole)) {
    return { error: "Choose a professional role." };
  }

  const contactRaw = trim(formData.get("contact_preference"), 32);
  const contactPref: ContactPreference | null =
    contactRaw && CONTACT.includes(contactRaw as ContactPreference)
      ? (contactRaw as ContactPreference)
      : null;
  const profileVisibilityRaw = trim(formData.get("profile_visibility"), 64);
  const profileVisibility: ProfileVisibility =
    profileVisibilityRaw &&
    PROFILE_VISIBILITIES.includes(profileVisibilityRaw as ProfileVisibility)
      ? (profileVisibilityRaw as ProfileVisibility)
      : "public_within_network";

  const website = optionalHttpUrl(formData.get("website"), "Website");
  if (!website.ok) return { error: website.error };
  const linkedin = optionalHttpUrl(formData.get("linkedin"), "LinkedIn");
  if (!linkedin.ok) return { error: linkedin.error };
  const avatar = optionalHttpUrl(formData.get("avatar_url"), "Avatar image URL");
  if (!avatar.ok) return { error: avatar.error };
  const brochure = optionalHttpUrl(formData.get("brochure_link"), "Brochure link");
  if (!brochure.ok) return { error: brochure.error };
  const deck = optionalHttpUrl(formData.get("deck_link"), "Deck link");
  if (!deck.ok) return { error: deck.error };
  const pdf = optionalHttpUrl(formData.get("materials_pdf_link"), "PDF link");
  if (!pdf.ok) return { error: pdf.error };

  const now = new Date().toISOString();

  const { data: existing, error: readErr } = await supabase
    .from("user_profiles")
    .select(
      "user_id, email, onboarding_completed_at, onboarding_skipped, invite_status, verification_status",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (readErr && isUserProfilesTableMissing(readErr)) {
    return {
      error:
        "The user_profiles table is not available. Apply the latest Supabase migrations (including 20260420201000_user_profiles_canonical_standard) and reload.",
    };
  }
  if (readErr) {
    return { error: readErr.message };
  }

  const onboardingCompletedAt =
    (existing?.onboarding_completed_at as string | null | undefined) ?? now;
  const onboardingSkipped =
    (existing?.onboarding_skipped as boolean | null | undefined) ?? false;
  const existingInviteStatus = parseInviteStatus(
    (existing as { invite_status?: string | null } | null | undefined)?.invite_status,
  );
  const nextInviteStatus = parseInviteStatus(
    trim(formData.get("invite_status"), 64) ?? existingInviteStatus,
  );
  const existingVerificationStatus = parseVerificationStatus(
    (existing as { verification_status?: string | null } | null | undefined)
      ?.verification_status,
  );

  const patch = {
    user_id: user.id,
    email: user.email ?? (existing?.email as string | null) ?? null,
    display_name: trim(formData.get("display_name"), 200),
    full_name: trim(formData.get("full_name"), 200),
    role: roleRaw as UserProfessionalRole,
    company: trim(formData.get("company"), 300),
    title: trim(formData.get("title"), 200),
    market: trim(formData.get("market"), 800),
    target_cities: trim(formData.get("target_cities"), 800),
    deal_size_range: trim(formData.get("deal_size_range"), 200),
    asset_interest: trim(formData.get("asset_interest"), 500),
    asset_type_interest: trim(formData.get("asset_type_interest"), 500),
    bio: trim(formData.get("bio"), 800),
    website: website.value,
    linkedin: linkedin.value,
    avatar_url: avatar.value,
    verification_status: existingVerificationStatus,
    contact_preference: contactPref,
    profile_visibility: profileVisibility,
    invite_status: nextInviteStatus,
    access_status: nextInviteStatus,
    network_access_notes: trim(formData.get("network_access_notes"), 1500),
    example_projects: trim(formData.get("example_projects"), 1800),
    project_notes: trim(formData.get("project_notes"), 1800),
    brochure_link: brochure.value,
    deck_link: deck.value,
    materials_pdf_link: pdf.value,
    floor_plan_placeholder: trim(formData.get("floor_plan_placeholder"), 800),
    concept_file_placeholder: trim(formData.get("concept_file_placeholder"), 800),
    currently_seeking: trim(formData.get("currently_seeking"), 1200),
    open_to_introductions: toBool(formData.get("open_to_introductions")),
    looking_for: trim(formData.get("looking_for"), 1200),
    preferred_contact_method: trim(formData.get("preferred_contact_method"), 64),
    available_for_in_person_meetings: toBool(
      formData.get("available_for_in_person_meetings"),
    ),
    preferred_meeting_cities: trim(formData.get("preferred_meeting_cities"), 500),
    phone: trim(formData.get("phone"), 64),
    intro_notes: trim(formData.get("intro_notes"), 1500),
    onboarding_completed_at: onboardingCompletedAt,
    onboarding_skipped: onboardingSkipped,
    updated_at: now,
  };

  const { error: writeErr } = await supabase
    .from("user_profiles")
    .upsert(patch, { onConflict: "user_id" });

  if (writeErr) {
    if (isUserProfilesTableMissing(writeErr)) {
      return {
        error:
          "The user_profiles table is not available. Apply the latest Supabase migrations and reload.",
      };
    }
    return { error: writeErr.message };
  }

  const meta = { ...(user.user_metadata ?? {}) } as Record<string, unknown>;
  meta.display_name = patch.display_name;
  meta.full_name = patch.full_name;
  meta.role = patch.role;
  meta.company = patch.company;
  meta.title = patch.title;
  meta.market = patch.market;
  meta.target_cities = patch.target_cities;
  meta.deal_size_range = patch.deal_size_range;
  meta.asset_interest = patch.asset_interest;
  meta.asset_type_interest = patch.asset_type_interest;
  meta.bio = patch.bio;
  meta.website = patch.website;
  meta.linkedin = patch.linkedin;
  meta.email = patch.email;
  meta.contact_preference = patch.contact_preference;
  meta.phone = patch.phone;
  meta.open_to_introductions = patch.open_to_introductions;
  meta.profile_visibility = patch.profile_visibility;
  meta.invite_status = patch.invite_status;
  meta.access_status = patch.access_status;
  meta.network_access_notes = patch.network_access_notes;
  meta.example_projects = patch.example_projects;
  meta.project_notes = patch.project_notes;
  meta.brochure_link = patch.brochure_link;
  meta.deck_link = patch.deck_link;
  meta.materials_pdf_link = patch.materials_pdf_link;
  meta.floor_plan_placeholder = patch.floor_plan_placeholder;
  meta.concept_file_placeholder = patch.concept_file_placeholder;
  meta.currently_seeking = patch.currently_seeking;
  meta.looking_for = patch.looking_for;
  meta.preferred_contact_method = patch.preferred_contact_method;
  meta.available_for_in_person_meetings = patch.available_for_in_person_meetings;
  meta.preferred_meeting_cities = patch.preferred_meeting_cities;
  meta.intro_notes = patch.intro_notes;
  meta.onboarding_completed_at =
    (existing?.onboarding_completed_at as string | undefined) ??
    meta.onboarding_completed_at ??
    now;
  meta.onboarding_skipped =
    (existing?.onboarding_skipped as boolean | undefined) ??
    meta.onboarding_skipped ??
    false;
  await supabase.auth.updateUser({ data: meta });
  await supabase.auth.refreshSession();

  revalidatePath("/profile");
  revalidatePath("/", "layout");
  return { error: null, success: true };
}
