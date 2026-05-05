"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  completeOnboarding,
  type OnboardingActionState,
} from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { UserProfessionalRole } from "@/types/user-profile";

const ROLES: { value: UserProfessionalRole; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "investor", label: "Investor" },
  { value: "broker", label: "Broker" },
  { value: "acquisition", label: "Acquisition team" },
  { value: "other", label: "Other" },
];

const initialState: OnboardingActionState = { error: null };

type OnboardingFormProps = {
  nextPath: string;
};

export function OnboardingForm({ nextPath }: OnboardingFormProps) {
  const [role, setRole] = useState<UserProfessionalRole | "">("");
  const [state, formAction, pending] = useActionState(
    completeOnboarding,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-14 sm:py-20">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
        Welcome
      </p>
      <h1 className="mt-3 text-center text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[1.65rem]">
        Tell us who you are
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-neutral-500">
        One step—optional details help us tailor Aervara and grow the network
        thoughtfully. You can always skip and finish later.
      </p>

      <form
        action={formAction}
        className="mt-10 space-y-8 rounded-2xl border border-stone-200/60 bg-white p-7 shadow-[0_2px_12px_rgba(15,23,42,0.04)] ring-1 ring-stone-900/[0.03] sm:p-8"
      >
        <input type="hidden" name="next" value={nextPath} />
        <input type="hidden" name="role" value={role} />

        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
            What best describes you?
          </legend>
          <div className="flex flex-wrap gap-2">
            {ROLES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={role === value}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                  "border-stone-200/80 bg-stone-50/50 text-neutral-700 hover:border-stone-300 hover:bg-white",
                  role === value &&
                    "border-neutral-900 bg-neutral-950 text-white shadow-sm",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <details className="group rounded-xl border border-stone-100 bg-stone-50/40 px-4 py-3 open:bg-stone-50/70">
          <summary className="cursor-pointer list-none text-sm font-medium text-neutral-700 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-2">
              Optional context
              <span className="text-xs font-normal text-neutral-400 group-open:hidden">
                Add firm, markets, interests…
              </span>
              <span className="hidden text-xs font-normal text-neutral-400 group-open:inline">
                Hide
              </span>
            </span>
          </summary>
          <div className="mt-5 space-y-4 border-t border-stone-200/50 pt-5">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-xs text-neutral-500">
                Company
              </Label>
              <Input id="company" name="company" placeholder="Optional" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market" className="text-xs text-neutral-500">
                Market & geography
              </Label>
              <Textarea
                id="market"
                name="market"
                rows={2}
                placeholder="e.g. Austin MSA · Sun Belt multifamily"
                className="resize-y text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_cities" className="text-xs text-neutral-500">
                Target cities
              </Label>
              <Input
                id="target_cities"
                name="target_cities"
                placeholder="e.g. Austin, Dallas, Nashville"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal_size_range" className="text-xs text-neutral-500">
                Deal size range
              </Label>
              <Input
                id="deal_size_range"
                name="deal_size_range"
                placeholder="e.g. $5M - $25M"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_interest" className="text-xs text-neutral-500">
                Asset interest
              </Label>
              <Input
                id="asset_interest"
                name="asset_interest"
                placeholder="e.g. Infill retail, mid-rise housing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset_type_interest" className="text-xs text-neutral-500">
                Asset type interest
              </Label>
              <Input
                id="asset_type_interest"
                name="asset_type_interest"
                placeholder="e.g. Multifamily, Industrial, Mixed-use"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs text-neutral-500">
                Short bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={500}
                placeholder="Optional—how you source or underwrite deals"
                className="resize-y text-sm"
              />
            </div>
          </div>
        </details>

        {state.error ? (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:gap-4">
          <Button
            type="submit"
            name="intent"
            value="skip"
            variant="ghost"
            className="text-neutral-600 hover:text-neutral-950"
            disabled={pending}
          >
            Skip for now
          </Button>
          <Button type="submit" name="intent" value="complete" disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-center text-xs text-neutral-400">
        <Link href="/" className="text-neutral-600 underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
