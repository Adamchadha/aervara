import type { Metadata } from "next";
import Link from "next/link";
import { ProFeaturePlaceholder } from "@/components/billing/pro-feature-placeholder";
import { CsvImportForm } from "@/components/properties/csv-import-form";
import { isDemoMode } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";
import { getPlanAccess } from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Import properties",
};

type ImportPageProps = {
  searchParams: Promise<{ demo?: string }>;
};

export default async function ImportPropertiesPage({ searchParams }: ImportPageProps) {
  const q = await searchParams;
  const isDemo = isDemoMode(q.demo);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const plan =
    user != null
      ? await getPlanAccess(supabase, user.id, user.email, {
          isProPreview: isDemo,
        })
      : null;

  const canImport = plan?.canUseCsvImport ?? false;
  const readOnly = isDemo;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={withDemoQuery("/dashboard", isDemo)}
          className="text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950">
          Import from CSV
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Upload a file to see column mapping, row-level validation, and modeled
          opportunity signals before you commit. Valid rows import in bulk with
          FAR metrics and scores stored on each property—you return to the
          dashboard with rankings ready.
        </p>
      </div>
      {readOnly ? (
        <p className="rounded-xl border border-amber-200/70 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          Demo preview: upload a CSV to see mapping and row validation. Imports do
          not run until you have full access.
        </p>
      ) : null}
      {canImport ? (
        <CsvImportForm
          readOnly={readOnly}
          dashboardHref={withDemoQuery("/dashboard", isDemo)}
        />
      ) : (
        <ProFeaturePlaceholder
          gateDebug={plan?.gateDebug}
          title="CSV import"
          description="Bulk import with validation and preview unlocks with full access, alongside unlimited parcels and PDF deal reports."
        />
      )}
    </div>
  );
}
