import type { Metadata } from "next";
import Link from "next/link";
import { CsvImportForm } from "@/components/properties/csv-import-form";

export const metadata: Metadata = {
  title: "Import properties",
};

export default function ImportPropertiesPage() {
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
          Import from CSV
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Choose a CSV to see a live preview and validation for every row. Valid
          rows are inserted in bulk with FAR, opportunity value, and derived fields
          computed automatically—then you land on the dashboard to rank deals.
        </p>
      </div>
      <CsvImportForm />
    </div>
  );
}
