import Link from "next/link";
import { PropertyForm } from "@/components/properties/property-form";

export default function NewPropertyPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
          Add property
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Model as-of-right FAR, unused envelope, and rough opportunity value—then
          track it on your dashboard.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
