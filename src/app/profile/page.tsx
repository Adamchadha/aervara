import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Aervara account profile.",
};
import { ProfileEditor } from "@/components/profile/profile-editor";
import { ProfileDealActivitySection } from "@/components/profile/profile-deal-activity-section";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import type { DealRoomInterestRow } from "@/components/properties/property-deal-room";
import { buildDealActivityTimeline, type MeetingTimelineRow } from "@/lib/deal-activity-timeline";
import { createClient } from "@/lib/supabase/server";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { isDemoMode, requestFullAccessHref } from "@/lib/demo-flow";
import { PlanGateDebugRibbon } from "@/components/dev/plan-gate-debug-ribbon";
import { getPlanAccess } from "@/lib/plan-access";
import {
  fetchUserProfileRow,
  profileFormSeed,
} from "@/lib/user-profile-db";
import type { IntroductionRequestRow } from "@/types/introduction-request";
import type { PropertyDealActivityRow } from "@/types/deal-activity";
import type { UserProfileRow } from "@/types/user-profile";

type ProfilePageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const sp = await searchParams;
  const isDemo = isDemoMode(sp.demo);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      isDemo
        ? `/login?redirect=${encodeURIComponent("/profile?demo=true")}`
        : "/login?redirect=/profile",
    );
  }
  const approvalProfile = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(approvalProfile, { isDemo, userId: user.id })) {
    redirect("/apply");
  }

  const plan = await getPlanAccess(supabase, user.id, user.email, {
    isProPreview: isDemo,
  });

  let row: UserProfileRow | null = null;
  let tableMissing = false;
  try {
    const r = await fetchUserProfileRow(supabase, user.id);
    row = r.row;
    tableMissing = r.tableMissing;
  } catch {
    row = null;
    tableMissing = false;
  }
  const seed = profileFormSeed(row, user);

  const { data: savedRows } = await supabase
    .from("properties")
    .select("id, address, city, state, status")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(12);

  const { data: priorityRows } = await supabase
    .from("properties")
    .select("id, address, city, state, status")
    .eq("user_id", user.id)
    .eq("status", "Priority")
    .order("updated_at", { ascending: false })
    .limit(12);

  const { count: introCount } = await supabase
    .from("property_introduction_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: meetingCount } = await supabase
    .from("property_meeting_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: siteVisitPlannedCount } = await supabase
    .from("property_deal_activity_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_type", "site_visit_planned");

  const { data: interestRows } = await supabase
    .from("property_deal_interests")
    .select("id, user_id, user_role, intent, message, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: introRows } = await supabase
    .from("property_introduction_requests")
    .select("id, target_role, purpose, message, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: meetingRows } = await supabase
    .from("property_meeting_requests")
    .select("id, meeting_type, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: activityRows } = await supabase
    .from("property_deal_activity_events")
    .select("id, property_id, user_id, event_type, detail, metadata, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const timeline = buildDealActivityTimeline({
    interests: (interestRows ?? []) as DealRoomInterestRow[],
    introductions: (introRows ?? []) as IntroductionRequestRow[],
    meetings: (meetingRows ?? []) as MeetingTimelineRow[],
    activityEvents: ((activityRows ?? []) as PropertyDealActivityRow[]).map((r) => ({
      ...r,
      metadata:
        r.metadata && typeof r.metadata === "object" && !Array.isArray(r.metadata)
          ? r.metadata
          : {},
    })),
  }).slice(0, 16);

  const profileHeaderApplyHref = requestFullAccessHref({
    nextPath: isDemo ? "/profile?demo=true" : "/profile",
    sourceRoute: isDemo ? "/profile?demo=true" : "/profile",
  });

  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">
      <SiteHeader
        demoAccess={isDemo}
        accessRequestHref={isDemo ? profileHeaderApplyHref : undefined}
      />
      <PlanGateDebugRibbon isProPreview={isDemo} />
      <main className="flex flex-1 flex-col">
        {tableMissing ? (
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/90">
              Database setup
            </p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950">
              Apply the profile migration
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              The <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">user_profiles</code>{" "}
              table is not in your Supabase project yet. Run pending migrations
              (including{" "}
              <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                20260420201000_user_profiles_canonical_standard
              </code>
              ), then reload this page.
            </p>
            <Button asChild className="mt-8 rounded-xl">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
            <ProfileEditor
              key={seed.updated_at}
              userEmail={user.email ?? null}
              seed={seed}
              planBillingTier={plan.billingTier}
              isPlatformAdmin={plan.isPlatformAdmin}
              isDemoPreview={isDemo}
            />
            <ProfileDealActivitySection
              savedProperties={(savedRows ?? [])}
              priorityProperties={(priorityRows ?? [])}
              introductionsRequested={introCount ?? 0}
              meetingsRequested={meetingCount ?? 0}
              siteVisitsPlanned={siteVisitPlannedCount ?? 0}
              timeline={timeline}
            />
          </div>
        )}
      </main>
    </div>
  );
}
