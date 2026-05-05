"use client";

import { useActionState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  submitAccessApplication,
  type AccessApplicationState,
} from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  USER_PROFESSIONAL_ROLE_VALUES,
  type UserProfessionalRole,
} from "@/types/user-profile";
import { buildApplyPath } from "@/lib/demo-flow";
import { cn } from "@/lib/utils";

const initialState: AccessApplicationState = { error: null };

const ROLE_LABELS: Record<UserProfessionalRole, string> = {
  developer: "Developer",
  investor: "Investor",
  broker: "Broker",
  acquisition: "Acquisition team",
  other: "Other",
};

type ApplyForAccessFormProps = {
  status: "pending" | "approved" | "rejected";
  defaultFullName: string;
  defaultEmail: string;
  defaultRole: UserProfessionalRole;
  defaultCompany: string;
  defaultCityMarket: string;
  sourceRoute: string;
  requestedFromDemo: boolean;
  nextPath: string;
};

function SectionCard({
  kicker,
  title,
  children,
  className,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-200/50 bg-white/90 px-6 py-7 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_20px_48px_-28px_rgba(15,23,42,0.1)] backdrop-blur-sm ring-1 ring-stone-900/[0.035] sm:px-7 sm:py-8",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {kicker}
      </p>
      <h2 className="mt-3 text-sm font-semibold tracking-tight text-neutral-950">
        {title}
      </h2>
      <div className="mt-4 text-sm leading-[1.65] text-neutral-600">{children}</div>
    </div>
  );
}

export function ApplyForAccessForm({
  status,
  defaultFullName,
  defaultEmail,
  defaultRole,
  defaultCompany,
  defaultCityMarket,
  sourceRoute,
  requestedFromDemo,
  nextPath,
}: ApplyForAccessFormProps) {
  const [state, formAction, pending] = useActionState(
    submitAccessApplication,
    initialState,
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationWithQuery = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
  const applyCanonHref = buildApplyPath({
    next: searchParams.get("next") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    demo: searchParams.get("demo") ?? undefined,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (!state.success) return;
    console.info("[request-flow] access application submitted successfully", {
      location: locationWithQuery,
      applyUrl: applyCanonHref,
      afterSubmitNext: nextPath,
      sourceRoute,
    });
  }, [state.success, locationWithQuery, applyCanonHref, nextPath, sourceRoute]);

  const statusLabel =
    status === "approved"
      ? "Approved"
      : status === "rejected"
        ? "Not admitted"
        : "Under review";

  return (
    <div className="relative mx-auto w-full max-w-3xl px-5 pb-24 pt-16 sm:px-8 sm:pb-28 sm:pt-20 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone-300/60 to-transparent"
      />

      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
          Invitation
        </p>
        <h1 className="mx-auto mt-5 max-w-[20ch] text-[2rem] font-semibold leading-[1.08] tracking-[-0.04em] text-neutral-950 sm:text-[2.35rem] sm:tracking-[-0.042em]">
          Private Access Only
        </h1>
        <div className="mx-auto mt-8 max-w-xl space-y-4 text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base sm:leading-relaxed">
          <p>
            Aervara connects developers, investors, and brokers to off-market air
            rights opportunities.
          </p>
          <p className="text-neutral-500">
            Access is limited to vetted participants.
          </p>
        </div>
      </header>

      <div className="mt-16 grid gap-5 sm:mt-20 sm:gap-6 lg:grid-cols-3">
        <SectionCard kicker="01" title="Why Aervara exists">
          <p>
            Air rights and underbuilt density rarely surface on public feeds. We
            built Aervara for qualified groups who need signal, not noise—paired
            with discretion and a structured path from screen to conversation.
          </p>
        </SectionCard>
        <SectionCard kicker="02" title="Who it's for">
          <ul className="space-y-3">
            {(["Developers", "Investors", "Brokers"] as const).map((role) => (
              <li
                key={role}
                className="flex items-center gap-3 text-neutral-800"
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                <span className="font-medium tracking-tight">{role}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard kicker="03" title="What they get">
          <ul className="space-y-4">
            <li>
              <span className="font-medium text-neutral-900">Deal flow</span>
              <span className="mt-1 block text-neutral-600">
                Curated opportunities aligned to mandate and geography.
              </span>
            </li>
            <li>
              <span className="font-medium text-neutral-900">Access</span>
              <span className="mt-1 block text-neutral-600">
                Private parcel intelligence and structured Site Rooms.
              </span>
            </li>
            <li>
              <span className="font-medium text-neutral-900">Network</span>
              <span className="mt-1 block text-neutral-600">
                Introductions across a vetted professional layer.
              </span>
            </li>
          </ul>
        </SectionCard>
      </div>

      <div className="mt-14 flex flex-col items-center gap-4 border-t border-stone-200/50 pt-14 sm:mt-16 sm:pt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Your status
        </p>
        <p className="text-sm font-medium tracking-tight text-neutral-900">
          {statusLabel}
        </p>
        {status === "pending" ? (
          <p className="max-w-md text-center text-xs leading-relaxed text-neutral-500">
            If you have already submitted, we will respond when your application
            has been reviewed.
          </p>
        ) : null}
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <div className="mt-6 rounded-xl border border-violet-200/70 bg-violet-50/70 px-4 py-3 font-mono text-[11px] leading-relaxed text-violet-900">
          [request-flow debug] location={locationWithQuery} · applyUrl={applyCanonHref}{" "}
          · afterSubmitNext={nextPath} · sourceRoute={sourceRoute} · submitSuccess=
          {String(!!state.success)}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-12 sm:mt-14">
          <div className="overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-emerald-50/80 via-white to-white px-6 py-12 text-center shadow-[0_24px_64px_-32px_rgba(15,23,42,0.12)] ring-1 ring-emerald-900/[0.04] sm:px-10 sm:py-14">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-200/80 bg-white text-xl font-semibold text-emerald-800 shadow-sm"
              aria-hidden
            >
              ✓
            </div>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-800/80">
              Received
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-neutral-950 sm:text-2xl">
              Your access request is in review
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              We read every submission in confidence. If there is a fit, you will
              hear from us with next steps—typically within a few business days.
            </p>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild className="min-w-[12rem] rounded-xl">
                <Link href={nextPath}>Continue in Aervara</Link>
              </Button>
              <Button variant="secondary" asChild className="min-w-[12rem] rounded-xl">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <form
          action={formAction}
          className="mt-12 overflow-hidden rounded-2xl border border-stone-200/55 bg-white shadow-[0_24px_64px_-32px_rgba(15,23,42,0.14)] ring-1 ring-stone-900/[0.035] sm:mt-14"
        >
          <input type="hidden" name="source_route" value={sourceRoute} />
          <input
            type="hidden"
            name="requested_from_demo"
            value={requestedFromDemo ? "true" : "false"}
          />
          <div className="border-b border-stone-100/90 bg-stone-50/40 px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
              Request access
            </p>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-600">
              A concise profile helps us evaluate fit. Submissions are read in
              confidence and used only for admission decisions.
            </p>
          </div>
          <div className="space-y-6 px-6 py-8 sm:px-8 sm:py-9">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-medium text-neutral-700">
                  Full name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  required
                  autoComplete="name"
                  defaultValue={defaultFullName}
                  placeholder="Jordan Lee"
                  className="border-stone-200/80 bg-stone-50/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-neutral-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  defaultValue={defaultEmail}
                  placeholder="you@firm.com"
                  className="border-stone-200/80 bg-stone-50/30"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-medium text-neutral-700">
                  Role
                </Label>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue={
                    USER_PROFESSIONAL_ROLE_VALUES.includes(defaultRole)
                      ? defaultRole
                      : "developer"
                  }
                  className="flex h-11 w-full rounded-xl border border-stone-200/90 bg-stone-50/30 px-3.5 text-sm text-neutral-950 shadow-sm outline-none transition-colors focus-visible:border-stone-300 focus-visible:ring-2 focus-visible:ring-neutral-950/10"
                >
                  {USER_PROFESSIONAL_ROLE_VALUES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-xs font-medium text-neutral-700">
                  Company / firm
                </Label>
                <Input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  defaultValue={defaultCompany}
                  placeholder="Optional"
                  className="border-stone-200/80 bg-stone-50/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_market" className="text-xs font-medium text-neutral-700">
                City / market focus
              </Label>
              <Input
                id="city_market"
                name="city_market"
                required
                defaultValue={defaultCityMarket}
                placeholder="e.g. Los Angeles multifamily infill"
                className="border-stone-200/80 bg-stone-50/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="use_case" className="text-xs font-medium text-neutral-700">
                Use case
              </Label>
              <Textarea
                id="use_case"
                name="use_case"
                rows={5}
                required
                minLength={10}
                maxLength={4000}
                placeholder="Mandate, deal size, what you want to see inside Aervara, and how you intend to use parcel intelligence."
                className="resize-y border-stone-200/80 bg-stone-50/30 text-[0.9375rem] leading-relaxed placeholder:text-neutral-400 focus-visible:border-stone-300 focus-visible:ring-stone-400/20"
              />
            </div>

            {state.error ? (
              <p className="text-sm text-red-600" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-4 border-t border-stone-100/90 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/"
                className="text-center text-xs font-medium text-neutral-500 underline-offset-[6px] transition-colors hover:text-neutral-800 sm:text-left"
              >
                Return to home
              </Link>
              <Button type="submit" disabled={pending} className="min-w-[11rem]">
                {pending ? "Submitting…" : "Submit request"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
