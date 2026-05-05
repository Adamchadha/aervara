"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAccessRequestsTableMissing } from "@/lib/access-requests-db";
import { createClient } from "@/lib/supabase/server";
import { getSafeInternalRedirect } from "@/lib/safe-redirect";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";
import {
  USER_PROFESSIONAL_ROLE_VALUES,
  type UserProfessionalRole,
} from "@/types/user-profile";

const ROLES: readonly UserProfessionalRole[] = USER_PROFESSIONAL_ROLE_VALUES;

const accessRequestRoleSchema = z.enum(
  USER_PROFESSIONAL_ROLE_VALUES as unknown as [
    UserProfessionalRole,
    ...UserProfessionalRole[],
  ],
);

const accessRequestInsertSchema = z.object({
  full_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  role: accessRequestRoleSchema,
  company: z
    .string()
    .trim()
    .max(240)
    .transform((s) => (s.length === 0 ? null : s)),
  city_market: z.string().trim().min(1).max(500),
  use_case: z.string().trim().min(10).max(4000),
  source_route: z.string().trim().min(1).max(2000),
  requested_from_demo: z.boolean(),
});

async function inferSourceRouteFromRequest(formValue: string | null): Promise<string> {
  const t = formValue?.trim();
  if (t && t.startsWith("/")) return t.slice(0, 2000);
  const h = await headers();
  const referer = h.get("referer");
  if (referer) {
    try {
      const u = new URL(referer);
      const path = u.pathname + u.search;
      if (path.startsWith("/")) return path.slice(0, 2000);
    } catch {
      /* ignore */
    }
  }
  return "/apply";
}


function str(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

async function syncUserProfileRow(
  supabase: SupabaseServer,
  userId: string,
  userEmail: string | null | undefined,
  patch: Record<string, unknown>,
): Promise<{ error: Error | null }> {
  const { data: existing, error: readErr } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (readErr && isUserProfilesTableMissing(readErr)) {
    return { error: null };
  }
  if (readErr) {
    return { error: new Error(readErr.message) };
  }

  const emailPatch =
    userEmail != null && userEmail.trim() !== ""
      ? { email: userEmail.trim() }
      : {};

  if (existing) {
    const { error } = await supabase
      .from("user_profiles")
      .update({ ...emailPatch, ...patch })
      .eq("user_id", userId);
    return { error: error ? new Error(error.message) : null };
  }

  const { error } = await supabase.from("user_profiles").insert({
    user_id: userId,
    ...emailPatch,
    ...patch,
  });
  return { error: error ? new Error(error.message) : null };
}

export type OnboardingActionState = { error: string | null };
export type AccessApplicationState = {
  error: string | null;
  success?: boolean;
};

export async function completeOnboarding(
  _prev: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const intent = formData.get("intent");
  const skip = intent === "skip";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/onboarding");
  }

  const nextRaw = formData.get("next");
  const next = getSafeInternalRedirect(
    typeof nextRaw === "string" ? nextRaw : null,
    "/dashboard",
  );

  const now = new Date().toISOString();
  const baseMeta = { ...(user.user_metadata ?? {}) } as Record<string, unknown>;

  if (skip) {
    baseMeta.onboarding_skipped = true;
    baseMeta.onboarding_completed_at = now;
    const { error } = await supabase.auth.updateUser({ data: baseMeta });
    if (error) {
      return { error: error.message };
    }
    await supabase.auth.refreshSession();

    const { error: rowErr } = await syncUserProfileRow(
      supabase,
      user.id,
      user.email,
      {
        onboarding_skipped: true,
        onboarding_completed_at: now,
        updated_at: now,
      },
    );
    if (rowErr) {
      return { error: rowErr.message };
    }

    revalidatePath("/", "layout");
    redirect(next);
  }

  const roleRaw = str(formData.get("role"));
  if (!roleRaw || !ROLES.includes(roleRaw as UserProfessionalRole)) {
    return { error: "Choose a role to continue, or skip for now." };
  }

  const company = str(formData.get("company"));
  const market = str(formData.get("market"));
  const targetCities = str(formData.get("target_cities"));
  const assetInterest = str(formData.get("asset_interest"));
  const assetTypeInterest = str(formData.get("asset_type_interest"));
  const dealSizeRange = str(formData.get("deal_size_range"));
  const bio = str(formData.get("bio"));

  baseMeta.role = roleRaw;
  baseMeta.company = company;
  baseMeta.market = market;
  baseMeta.target_cities = targetCities;
  baseMeta.deal_size_range = dealSizeRange;
  baseMeta.asset_interest = assetInterest;
  baseMeta.asset_type_interest = assetTypeInterest;
  baseMeta.bio = bio;
  baseMeta.onboarding_skipped = false;
  baseMeta.onboarding_completed_at = now;

  const { error } = await supabase.auth.updateUser({ data: baseMeta });
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.refreshSession();

  const { error: rowErr } = await syncUserProfileRow(
    supabase,
    user.id,
    user.email,
    {
      role: roleRaw,
      company,
      market,
      target_cities: targetCities,
      deal_size_range: dealSizeRange,
      asset_interest: assetInterest,
      asset_type_interest: assetTypeInterest,
      bio,
      onboarding_skipped: false,
      onboarding_completed_at: now,
      updated_at: now,
    },
  );
  if (rowErr) {
    return { error: rowErr.message };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function submitAccessApplication(
  _prev: AccessApplicationState,
  formData: FormData,
): Promise<AccessApplicationState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const sourceRoute = await inferSourceRouteFromRequest(
    typeof formData.get("source_route") === "string"
      ? (formData.get("source_route") as string)
      : null,
  );

  const demoRaw = formData.get("requested_from_demo");
  const requestedFromDemo =
    demoRaw === "true" || demoRaw === "1" || demoRaw === "on";

  const companyRaw = typeof formData.get("company") === "string" ? formData.get("company") as string : "";
  const parsed = accessRequestInsertSchema.safeParse({
    full_name: str(formData.get("full_name")),
    email: str(formData.get("email")),
    role: str(formData.get("role")),
    company: companyRaw,
    city_market: str(formData.get("city_market")),
    use_case: str(formData.get("use_case")),
    source_route: sourceRoute,
    requested_from_demo: requestedFromDemo,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat()[0] ??
      "Check the form fields and try again.";
    return { error: msg };
  }

  const row = parsed.data;

  const { error: insertErr } = await supabase.from("access_requests").insert({
    user_id: user.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    company: row.company,
    city_market: row.city_market,
    use_case: row.use_case,
    source_route: row.source_route,
    requested_from_demo: row.requested_from_demo,
  });

  if (insertErr) {
    if (isAccessRequestsTableMissing(insertErr)) {
      return {
        error:
          "Access requests are not set up in this database yet. Apply the latest Supabase migration (access_requests), then try again.",
      };
    }
    return { error: insertErr.message };
  }

  const now = new Date().toISOString();
  const profileNote = row.use_case.slice(0, 1200);
  const patch = {
    invite_status: "pending",
    access_status: "pending",
    verification_status: "unverified",
    is_approved: false,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    company: row.company,
    market: row.city_market,
    network_access_notes: profileNote,
    updated_at: now,
  };

  const { error: rowErr } = await syncUserProfileRow(
    supabase,
    user.id,
    user.email,
    patch,
  );
  if (rowErr) return { error: rowErr.message };

  const meta = { ...(user.user_metadata ?? {}) } as Record<string, unknown>;
  meta.invite_status = "pending";
  meta.access_status = "pending";
  meta.verification_status = "unverified";
  meta.full_name = row.full_name;
  meta.role = row.role;
  meta.company = row.company;
  meta.market = row.city_market;
  meta.network_access_notes = profileNote;
  const { error: metaErr } = await supabase.auth.updateUser({ data: meta });
  if (metaErr) return { error: metaErr.message };
  await supabase.auth.refreshSession();

  revalidatePath("/", "layout");
  revalidatePath("/onboarding");
  revalidatePath("/admin/access-requests");
  return { error: null, success: true };
}
