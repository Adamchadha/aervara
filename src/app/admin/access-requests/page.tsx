import Link from "next/link";
import { redirect } from "next/navigation";
import {
  fetchExclusivityRow,
  isApprovedForPlatform,
} from "@/lib/exclusivity-access";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { isAdmin } from "@/lib/plan-gates";
import { createClient } from "@/lib/supabase/server";
import type { AccessRequestRow } from "@/types/access-request";

export default async function AdminAccessRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/access-requests");
  }

  const profile = await fetchExclusivityRow(supabase, user.id);
  if (!isApprovedForPlatform(profile, { userId: user.id })) {
    redirect(
      requestFullAccessHref({
        nextPath: "/admin/access-requests",
        sourceRoute: "/admin/access-requests",
      }),
    );
  }

  const userIsAdmin = isAdmin({
    userId: user.id,
    email: user.email,
    appRole: profile?.role ?? null,
  });
  if (!userIsAdmin) {
    redirect("/dashboard");
  }

  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-sm text-red-700">
        Could not load access requests: {error.message}
      </div>
    );
  }

  const rows = (data ?? []) as AccessRequestRow[];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="border-b border-stone-200/60 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Internal
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950">
          Access requests
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Leads captured from the Request Full Access flow. Demo-sourced rows are
          flagged for context.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-sky-900 underline-offset-4 hover:underline"
        >
          ← Back to dashboard
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center text-sm text-neutral-600">
          No access requests yet.
        </div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-stone-200/70 bg-white px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.02] sm:px-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    {r.full_name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{r.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {r.requested_from_demo ? (
                    <span className="rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-900">
                      From demo
                    </span>
                  ) : null}
                  <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                    {r.role}
                  </span>
                </div>
              </div>
              <dl className="mt-4 grid gap-2 text-xs text-neutral-600 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-neutral-400">Company</dt>
                  <dd className="mt-0.5">{r.company ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-400">City / market</dt>
                  <dd className="mt-0.5">{r.city_market}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium text-neutral-400">Source route</dt>
                  <dd className="mt-0.5 font-mono text-[11px] text-neutral-700">
                    {r.source_route}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium text-neutral-400">Use case</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-800">
                    {r.use_case}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-neutral-400">Submitted</dt>
                  <dd className="mt-0.5">
                    {new Date(r.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
