"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveUserProfile,
  type ProfileActionState,
} from "@/app/profile/actions";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  type BillingTier,
  type ContactPreference,
  type InviteStatus,
  type ProfileVisibility,
  type UserProfileRow,
  parseBillingTier,
  parseInviteStatus,
  parseProfileVisibility,
  parseVerificationStatus,
} from "@/types/user-profile";
import { StripePlanActions } from "@/components/billing/stripe-plan-actions";

const ROLES: {
  value: NonNullable<UserProfileRow["role"]>;
  label: string;
}[] = [
  { value: "developer", label: "Developer" },
  { value: "investor", label: "Investor" },
  { value: "broker", label: "Broker" },
  { value: "acquisition", label: "Acquisition team" },
  { value: "other", label: "Other" },
];

const CONTACT_OPTIONS: { value: ContactPreference; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "website", label: "Website" },
  { value: "in_app", label: "In-app (when available)" },
  { value: "no_preference", label: "No preference" },
];

const BILLING_LABELS: Record<BillingTier, string> = {
  free: "Free",
  pro: "Pro",
  elite: "Elite",
};

const PROFILE_VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string }[] = [
  { value: "public_within_network", label: "Public within network" },
  { value: "limited", label: "Limited" },
  { value: "private", label: "Private" },
];
const INVITE_STATUS_OPTIONS: { value: InviteStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const initial: ProfileActionState = { error: null };

const COMPLETENESS_FIELDS: Array<keyof UserProfileRow> = [
  "role",
  "company",
  "title",
  "market",
  "target_cities",
  "deal_size_range",
  "asset_type_interest",
  "bio",
  "open_to_introductions",
  "preferred_contact_method",
  "looking_for",
  "example_projects",
  "currently_seeking",
  "display_name",
  "full_name",
];

function scoreProfile(seed: UserProfileRow): number {
  const filled = COMPLETENESS_FIELDS.filter((k) => {
    const v = seed[k];
    return typeof v === "string" ? v.trim() !== "" : v != null;
  }).length;
  const n = COMPLETENESS_FIELDS.length;
  if (n === 0) return 0;
  return Math.round((filled / n) * 100);
}

function billingTone(tier: BillingTier): string {
  switch (tier) {
    case "elite":
      return "border-amber-200/85 bg-amber-50/80 text-amber-950";
    case "pro":
      return "border-violet-200/80 bg-violet-50/75 text-violet-900";
    case "free":
    default:
      return "border-stone-200/85 bg-stone-50/80 text-neutral-700";
  }
}

type ProfileEditorProps = {
  userEmail: string | null;
  seed: UserProfileRow;
  /** Effective tier from server (admin / env-pro / Stripe row). */
  planBillingTier?: BillingTier;
  isPlatformAdmin?: boolean;
  isDemoPreview?: boolean;
};

export function ProfileEditor({
  userEmail,
  seed,
  planBillingTier,
  isPlatformAdmin = false,
  isDemoPreview = false,
}: ProfileEditorProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveUserProfile,
    initial,
  );

  const publicName =
    seed.full_name?.trim() || seed.display_name?.trim() || "Your name";
  const completeness = scoreProfile(seed);
  const tier =
    planBillingTier ?? parseBillingTier(seed.membership_tier);
  const tierLabel = BILLING_LABELS[tier];
  const visibility = parseProfileVisibility(seed.profile_visibility);
  const verificationLabel =
    parseVerificationStatus(seed.verification_status) === "verified"
      ? "Verified"
      : "Unverified";
  const inviteStatus = parseInviteStatus(seed.invite_status);

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          Account
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-neutral-950 sm:text-[2rem]">
          Your profile
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
          How you show up across Aervara. Keep this current so collaborators
          understand who they are working with.
        </p>
      </header>

      <section
        className={cn(
          "mt-12 rounded-2xl border border-neutral-200/60 bg-white p-8 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-neutral-950/[0.03] sm:p-10",
        )}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
          <ProfileAvatar
            displayName={seed.full_name ?? seed.display_name}
            email={userEmail}
            avatarUrl={seed.avatar_url}
            size="lg"
          />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
              {publicName}
            </p>
            <p className="mt-1 text-sm text-neutral-500">{userEmail}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
                  billingTone(tier),
                )}
              >
                {tierLabel}
              </span>
              <span className="rounded-full border border-stone-200/80 bg-stone-50/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-600">
                {verificationLabel}
              </span>
              <UserRoleBadge role={seed.role} size="sm" />
            </div>
            <div className="mt-4 max-w-sm">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                <span>Profile completeness</span>
                <span>{completeness}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-stone-500 transition-[width] duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-col items-center gap-1.5 sm:items-start">
              <p className="text-[11px] text-neutral-400">
                Shown on deal interest and in the deal room when you engage.
              </p>
            </div>
            {seed.company?.trim() ? (
              <p className="mt-3 text-sm text-neutral-600">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  Company
                </span>
                <span className="mt-0.5 block font-medium text-neutral-800">
                  {seed.company}
                </span>
              </p>
            ) : null}
            {seed.market?.trim() ? (
              <p className="mt-3 text-sm text-neutral-600">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  Market
                </span>
                <span className="mt-0.5 block whitespace-pre-wrap">
                  {seed.market}
                </span>
              </p>
            ) : null}
            {seed.target_cities?.trim() ? (
              <p className="mt-3 text-sm text-neutral-600">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  Target cities
                </span>
                <span className="mt-0.5 block whitespace-pre-wrap">
                  {seed.target_cities}
                </span>
              </p>
            ) : null}
            {seed.bio?.trim() ? (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-600">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-400">
                  Bio
                </span>
                <span className="mt-1 line-clamp-3 block text-neutral-700">
                  {seed.bio.trim()}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
          Edit profile
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Changes save to your account and stay private until you share deals
          outward.
        </p>

        <form action={formAction} className="mt-8 space-y-10">
          {state.error ? (
            <div
              className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900"
              role="alert"
            >
              {state.error}
            </div>
          ) : null}
          {state.success ? (
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
              Profile saved.
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={seed.display_name ?? ""}
                placeholder="How you want to appear"
                autoComplete="nickname"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Legal / full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={seed.full_name ?? ""}
                placeholder="Jordan Lee"
                autoComplete="name"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                readOnly
                value={userEmail ?? ""}
                className="h-11 cursor-default rounded-xl border-neutral-200/60 bg-neutral-50/80 text-neutral-600"
              />
              <p className="text-xs text-neutral-500">
                Email is managed by your sign-in provider and synced to your profile row.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue={seed.role ?? "developer"}
                className="flex h-11 w-full rounded-xl border border-neutral-200/90 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950/10"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                defaultValue={seed.company ?? ""}
                placeholder="Atlas Development"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={seed.title ?? ""}
                placeholder="e.g. Managing Partner"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="market">Market & geography</Label>
              <Textarea
                id="market"
                name="market"
                rows={3}
                defaultValue={seed.market ?? ""}
                placeholder="e.g. Chicago MSA · Sunbelt multifamily · urban infill"
                className="min-h-[88px] rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_cities">Target cities</Label>
              <Input
                id="target_cities"
                name="target_cities"
                defaultValue={seed.target_cities ?? ""}
                placeholder="e.g. Miami, Atlanta, Phoenix"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_size_range">Deal size range</Label>
              <Input
                id="deal_size_range"
                name="deal_size_range"
                defaultValue={seed.deal_size_range ?? ""}
                placeholder="e.g. $10M - $75M"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="asset_interest">Asset / deal interest</Label>
              <Textarea
                id="asset_interest"
                name="asset_interest"
                rows={3}
                defaultValue={seed.asset_interest ?? ""}
                placeholder="What you pursue or source — size, product type, risk."
                className="min-h-[88px] rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="asset_type_interest">Asset type interest</Label>
              <Textarea
                id="asset_type_interest"
                name="asset_type_interest"
                rows={2}
                defaultValue={seed.asset_type_interest ?? ""}
                placeholder="e.g. Multifamily, Industrial, Office-to-resi conversion"
                className="min-h-[72px] rounded-xl border-neutral-200/90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              defaultValue={seed.bio ?? ""}
              placeholder="A sentence or two on how you work and what you care about in deals."
              className="min-h-[120px] rounded-xl border-neutral-200/90"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={seed.website ?? ""}
                placeholder="https://"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                defaultValue={seed.linkedin ?? ""}
                placeholder="https://www.linkedin.com/in/…"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="avatar_url">Profile image URL</Label>
              <Input
                id="avatar_url"
                name="avatar_url"
                type="url"
                defaultValue={seed.avatar_url ?? ""}
                placeholder="https://… (optional — otherwise initials are used)"
                className="h-11 rounded-xl border-neutral-200/90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_preference">Contact preference</Label>
            <select
              id="contact_preference"
              name="contact_preference"
              defaultValue={seed.contact_preference ?? "email"}
              className="flex h-11 w-full max-w-md rounded-xl border border-neutral-200/90 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950/10"
            >
              {CONTACT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-stone-50/60 via-white to-stone-50/20 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-neutral-950">
                  Plan & visibility
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  Billing tier is managed through Stripe. Visibility controls how
                  your profile appears in the network.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 rounded-xl border border-stone-200/80 bg-white/80 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                    Membership
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {tierLabel}
                    {seed.subscription_status ? (
                      <span className="ml-2 font-normal text-neutral-500">
                        · {seed.subscription_status}
                      </span>
                    ) : null}
                  </p>
                </div>
                <StripePlanActions
                  billingTier={tier}
                  stripeCustomerId={seed.stripe_customer_id}
                  suppressUpgradeLinks={isPlatformAdmin}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="profile_visibility">Profile visibility</Label>
                <select
                  id="profile_visibility"
                  name="profile_visibility"
                  defaultValue={visibility}
                  className="flex h-11 w-full rounded-xl border border-neutral-200/90 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950/10"
                >
                  {PROFILE_VISIBILITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_status">Invite status</Label>
                <select
                  id="invite_status"
                  name="invite_status"
                  defaultValue={inviteStatus}
                  className="flex h-11 w-full rounded-xl border border-neutral-200/90 bg-white px-3 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-950/10"
                >
                  {INVITE_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="network_access_notes">Network access notes</Label>
                <Textarea
                  id="network_access_notes"
                  name="network_access_notes"
                  rows={3}
                  defaultValue={seed.network_access_notes ?? ""}
                  placeholder="Private notes for curation context and trusted-intro routing."
                  className="min-h-[92px] rounded-xl border-neutral-200/90"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-stone-50/70 via-white to-stone-50/30 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-neutral-950">
                  Connection Preferences
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  Configure how Aervara should route introductions and meeting opportunities.
                </p>
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Connector layer
              </span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-white px-3.5 py-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="open_to_introductions"
                  defaultChecked={seed.open_to_introductions}
                  className="mt-1 size-4 rounded border-stone-300"
                />
                <span>
                  <span className="font-medium text-neutral-900">Open to introductions</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Public signal used in matching.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-white px-3.5 py-3 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="available_for_in_person_meetings"
                  defaultChecked={seed.available_for_in_person_meetings}
                  className="mt-1 size-4 rounded border-stone-300"
                />
                <span>
                  <span className="font-medium text-neutral-900">
                    Available for in-person meetings
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    Public signal for meeting coordination.
                  </span>
                </span>
              </label>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="looking_for">Looking for</Label>
                <Textarea
                  id="looking_for"
                  name="looking_for"
                  rows={2}
                  defaultValue={seed.looking_for ?? ""}
                  placeholder="e.g. Co-GP partner, LP relationships, off-market opportunities"
                  className="min-h-[72px] rounded-xl border-neutral-200/90"
                />
                <p className="text-xs text-neutral-500">Public summary for matching relevance.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method">Preferred contact method</Label>
                <Input
                  id="preferred_contact_method"
                  name="preferred_contact_method"
                  defaultValue={seed.preferred_contact_method ?? ""}
                  placeholder="e.g. Email first, then call"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
                <p className="text-xs text-neutral-500">Public preference.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_meeting_cities">Preferred meeting cities</Label>
                <Input
                  id="preferred_meeting_cities"
                  name="preferred_meeting_cities"
                  defaultValue={seed.preferred_meeting_cities ?? ""}
                  placeholder="e.g. NYC, Miami, Dallas"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
                <p className="text-xs text-neutral-500">Public for in-person planning.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number (private)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={seed.phone ?? ""}
                  placeholder="+1 (555) 123-4567"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
                <p className="text-xs text-neutral-500">
                  Private — used by Aervara for coordination, not shown publicly.
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="intro_notes">Intro notes / opportunity fit</Label>
                <Textarea
                  id="intro_notes"
                  name="intro_notes"
                  rows={3}
                  defaultValue={seed.intro_notes ?? ""}
                  placeholder="What kind of intros and opportunities are highest fit for you."
                  className="min-h-[92px] rounded-xl border-neutral-200/90"
                />
                <p className="text-xs text-neutral-500">
                  Private context for Aervara concierge and invitation workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-stone-50/70 via-white to-stone-50/30 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight text-neutral-950">
                  Projects & Materials
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  Showcase relevant project examples and materials so counterparties can
                  quickly assess fit. Link fields are placeholders for now (no uploads).
                </p>
              </div>
              <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
                Deal profile
              </span>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="example_projects">Example projects</Label>
                <Textarea
                  id="example_projects"
                  name="example_projects"
                  rows={3}
                  defaultValue={seed.example_projects ?? ""}
                  placeholder="Concise list: project, role, city, and headline outcome."
                  className="min-h-[88px] rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="project_notes">Project notes</Label>
                <Textarea
                  id="project_notes"
                  name="project_notes"
                  rows={2}
                  defaultValue={seed.project_notes ?? ""}
                  placeholder="Anything that adds credibility: process, constraints handled, track record detail."
                  className="min-h-[72px] rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brochure_link">Brochure link</Label>
                <Input
                  id="brochure_link"
                  name="brochure_link"
                  type="url"
                  defaultValue={seed.brochure_link ?? ""}
                  placeholder="https://"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deck_link">Deck link</Label>
                <Input
                  id="deck_link"
                  name="deck_link"
                  type="url"
                  defaultValue={seed.deck_link ?? ""}
                  placeholder="https://"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="materials_pdf_link">Brochure / PDF materials link</Label>
                <Input
                  id="materials_pdf_link"
                  name="materials_pdf_link"
                  type="url"
                  defaultValue={seed.materials_pdf_link ?? ""}
                  placeholder="https://"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor_plan_placeholder">
                  Floor plan placeholder
                </Label>
                <Input
                  id="floor_plan_placeholder"
                  name="floor_plan_placeholder"
                  defaultValue={seed.floor_plan_placeholder ?? ""}
                  placeholder="e.g. Available upon NDA / by request"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="concept_file_placeholder">
                  Concept file placeholder
                </Label>
                <Input
                  id="concept_file_placeholder"
                  name="concept_file_placeholder"
                  defaultValue={seed.concept_file_placeholder ?? ""}
                  placeholder="e.g. Concept package in progress"
                  className="h-11 rounded-xl border-neutral-200/90"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="currently_seeking">What you are currently seeking</Label>
                <Textarea
                  id="currently_seeking"
                  name="currently_seeking"
                  rows={3}
                  defaultValue={seed.currently_seeking ?? ""}
                  placeholder="Describe current opportunities, mandates, partners, or deal profiles you are actively seeking."
                  className="min-h-[92px] rounded-xl border-neutral-200/90"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-8">
            <Button
              type="submit"
              disabled={pending}
              className="h-11 min-w-[140px] rounded-xl px-6 text-sm font-semibold"
            >
              {pending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
