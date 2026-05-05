/**
 * Columns the app reads/writes on `public.user_profiles`.
 * Keep identical to: `supabase/migrations/20260420201000_user_profiles_canonical_standard.sql`
 */
export const USER_PROFILES_SELECT_COLUMNS =
  "user_id, email, role, display_name, full_name, company, title, market, target_cities, deal_size_range, asset_interest, asset_type_interest, bio, website, linkedin, contact_preference, membership_tier, stripe_customer_id, subscription_status, is_approved, profile_visibility, invite_status, access_status, network_access_notes, example_projects, project_notes, brochure_link, deck_link, materials_pdf_link, floor_plan_placeholder, concept_file_placeholder, currently_seeking, open_to_introductions, looking_for, preferred_contact_method, available_for_in_person_meetings, preferred_meeting_cities, phone, intro_notes, avatar_url, verification_status, onboarding_skipped, onboarding_completed_at, created_at, updated_at";
