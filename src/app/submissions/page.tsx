import Link from "next/link";
import { redirect } from "next/navigation";
import { ApprovePropertyButton } from "@/components/submissions/approve-property-button";
import { Button } from "@/components/ui/button";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { isAdmin } from "@/lib/plan-gates";
import { formatFar, formatMoney, formatSqft } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import { createClient } from "@/lib/supabase/server";
import type { PropertyRow } from "@/types/property";

export default async function SubmittedBuildingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/submissions");
  }
  const approvalProfile = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(approvalProfile, { userId: user.id })) {
    redirect(
      requestFullAccessHref({
        nextPath: "/submissions",
        sourceRoute: "/submissions",
      }),
    );
  }

  const userIsAdmin = isAdmin({
    userId: user.id,
    email: user.email,
    appRole: approvalProfile?.role ?? null,
  });
  const query = supabase
    .from("properties")
    .select("*")
    .eq("user_submitted", true)
    .order("created_at", { ascending: false });
  const { data, error } = await (userIsAdmin
    ? query
    : query.eq("user_id", user.id));

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-red-700">
        Could not load submissions: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as PropertyRow[];
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex items-end justify-between gap-3 border-b border-stone-200/60 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Submissions
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
            My Submitted Buildings
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {userIsAdmin
              ? "All user-submitted buildings awaiting verification and approval."
              : "Your user-entered building records awaiting verification and approval."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userIsAdmin ? (
            <Button variant="secondary" asChild>
              <Link href="/admin/access-requests">Access requests</Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/properties/new">Add Building / Data Input</Link>
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-sm text-neutral-600">
          No submissions yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((p) => {
            const m = getDisplayMetricsForRow(p);
            return (
              <li
                key={p.id}
                className="rounded-xl border border-stone-200/70 bg-white px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {p.address}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {p.city}, {p.state} · {p.zoning_district}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.needs_verification ? (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                        Under Review
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-900">
                        Verified by Aervara
                      </span>
                    )}
                    <Button variant="secondary" asChild>
                      <Link href={`/properties/${p.id}`}>Open</Link>
                    </Button>
                    {userIsAdmin && p.needs_verification ? (
                      <ApprovePropertyButton propertyId={p.id} />
                    ) : null}
                  </div>
                </div>
                <dl className="mt-4 grid gap-2 text-xs text-neutral-600 sm:grid-cols-3">
                  <div>
                    <dt className="uppercase tracking-[0.08em] text-neutral-400">
                      Max FAR
                    </dt>
                    <dd className="font-mono text-neutral-900">{formatFar(p.max_far)}</dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.08em] text-neutral-400">
                      Unused buildable
                    </dt>
                    <dd className="font-mono text-neutral-900">
                      {formatSqft(m.unused_buildable_sqft)} sq ft
                    </dd>
                  </div>
                  <div>
                    <dt className="uppercase tracking-[0.08em] text-neutral-400">
                      Air rights value
                    </dt>
                    <dd className="font-mono text-neutral-900">
                      {formatMoney(m.air_rights_value)}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

