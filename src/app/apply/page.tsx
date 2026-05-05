import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ApplyForAccessForm } from "@/components/onboarding/apply-for-access-form";
import { SiteHeader } from "@/components/layout/site-header";
import {
  buildApplyPath,
  inferDefaultSourceRoute,
  inferRequestedFromDemo,
} from "@/lib/demo-flow";
import { getSafeInternalRedirect } from "@/lib/safe-redirect";
import {
  fetchExclusivityRow,
  parseInviteStatus,
  isApprovedForApplyFlow,
} from "@/lib/exclusivity-access";
import { createClient } from "@/lib/supabase/server";
import { fetchUserProfileRow } from "@/lib/user-profile-db";
import {
  parseUserProfessionalRole,
  type UserProfessionalRole,
} from "@/types/user-profile";

function pickNext(
  sp: Record<string, string | string[] | undefined>,
): string | undefined {
  const v = sp.next;
  if (typeof v === "string") return v || undefined;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0] || undefined;
  return undefined;
}

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(buildApplyPath(sp))}`);
  }

  const profile = await fetchExclusivityRow(supabase, user.id);
  if (isApprovedForApplyFlow(profile, { userId: user.id })) {
    redirect(getSafeInternalRedirect(pickNext(sp), "/dashboard"));
  }

  const { row } = await fetchUserProfileRow(supabase, user.id);
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const defaultFullName =
    row?.full_name?.trim() ||
    row?.display_name?.trim() ||
    (typeof meta.full_name === "string" ? meta.full_name.trim() : "") ||
    "";
  const defaultEmail = (user.email ?? row?.email ?? "").trim();
  const parsedRole = parseUserProfessionalRole(row?.role);
  const defaultRole: UserProfessionalRole = parsedRole ?? "developer";
  const defaultCompany = row?.company?.trim() ?? "";
  const defaultCityMarket = [row?.market?.trim(), row?.target_cities?.trim()]
    .filter(Boolean)
    .join(" · ");

  const sourceRoute = inferDefaultSourceRoute(sp);
  const requestedFromDemo = inferRequestedFromDemo(sp);
  const nextPath = getSafeInternalRedirect(pickNext(sp), "/dashboard");

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-stone-100/50 via-[#faf9f7] to-[#f5f4f1]">
      <SiteHeader
        demoAccess={requestedFromDemo}
        accessRequestHref={
          requestedFromDemo ? buildApplyPath(sp) : undefined
        }
      />
      <main className="flex flex-1 flex-col">
        <Suspense
          fallback={
            <div className="mx-auto max-w-3xl px-5 py-24 text-center text-sm text-neutral-500">
              Loading application…
            </div>
          }
        >
          <ApplyForAccessForm
            status={parseInviteStatus(profile?.invite_status)}
            defaultFullName={defaultFullName}
            defaultEmail={defaultEmail}
            defaultRole={defaultRole}
            defaultCompany={defaultCompany}
            defaultCityMarket={defaultCityMarket}
            sourceRoute={sourceRoute}
            requestedFromDemo={requestedFromDemo}
            nextPath={nextPath}
          />
        </Suspense>
      </main>
    </div>
  );
}
