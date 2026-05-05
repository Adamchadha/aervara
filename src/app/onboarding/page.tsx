import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { SiteHeader } from "@/components/layout/site-header";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { getSafeInternalRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { hasCompletedOnboarding } from "@/lib/user-onboarding";

type OnboardingPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/onboarding");
  }

  const exclusivityRow = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(exclusivityRow, { userId: user.id })) {
    redirect(
      getSafeInternalRedirect(
        typeof sp.next === "string" ? `/apply?next=${encodeURIComponent(sp.next)}` : "/apply",
        "/apply",
      ),
    );
  }

  if (await hasCompletedOnboarding(supabase, user)) {
    redirect(
      getSafeInternalRedirect(
        typeof sp.next === "string" ? sp.next : null,
        "/dashboard",
      ),
    );
  }

  const nextPath = getSafeInternalRedirect(
    typeof sp.next === "string" ? sp.next : null,
    "/dashboard",
  );

  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <OnboardingForm nextPath={nextPath} />
      </main>
    </div>
  );
}
