"use client";

import { useActionState, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  importPropertiesFromCsv,
  type ImportCsvState,
} from "@/app/properties/actions";
import {
  buildCsvImportPreview,
  CSV_COLUMN_GUIDE,
  getMaxCsvFileBytes,
  MAX_CSV_ROWS,
} from "@/lib/csv-property-import";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: ImportCsvState = {};

const PREVIEW_DISPLAY_MAX = 35;

export function CsvImportForm() {
  const [state, formAction, pending] = useActionState(
    importPropertiesFromCsv,
    initialState,
  );

  const [fileKey, setFileKey] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [preview, setPreview] = useState<
    ReturnType<typeof buildCsvImportPreview> & { ok: true } | null
  >(null);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setPreview(null);
      setPreviewError(null);

      if (!file) {
        setFileName(null);
        return;
      }

      const maxBytes = getMaxCsvFileBytes();
      if (file.size > maxBytes) {
        setPreviewError(
          `File is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB).`,
        );
        setFileName(null);
        setFileKey((k) => k + 1);
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        const result = buildCsvImportPreview(text);
        if (!result.ok) {
          setPreviewError(result.error);
          return;
        }
        setPreview(result);
      };
      reader.onerror = () => {
        setPreviewError("Could not read this file.");
      };
      reader.readAsText(file);
    },
    [],
  );

  const resetFile = useCallback(() => {
    setFileKey((k) => k + 1);
    setFileName(null);
    setPreview(null);
    setPreviewError(null);
  }, []);

  const previewTableRows = useMemo(() => {
    if (!preview?.ok) return [];
    return preview.previewRows.slice(0, PREVIEW_DISPLAY_MAX);
  }, [preview]);

  const canSubmit =
    Boolean(fileName) &&
    preview?.ok === true &&
    preview.validCount > 0 &&
    !pending;

  return (
    <div className="max-w-4xl space-y-8">
      <form
        action={formAction}
        encType="multipart/form-data"
        className="space-y-8"
      >
        <div className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm ring-1 ring-neutral-950/[0.03] sm:p-8">
          <Label
            htmlFor="csv"
            className="text-sm font-medium text-neutral-950"
          >
            Upload CSV
          </Label>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Required columns:{" "}
            <span className="font-mono text-xs text-neutral-800">
              {CSV_COLUMN_GUIDE}
            </span>
            . Optional: notes, construction_cost_per_sqft, soft_cost_percentage,
            exit_value_per_sqft. Up to {MAX_CSV_ROWS} rows; numbers may include
            commas or $.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              key={fileKey}
              id="csv"
              name="csv"
              type="file"
              accept=".csv,text/csv"
              required
              onChange={onFileChange}
              className={cn(
                "block w-full max-w-md text-sm text-neutral-700",
                "file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-neutral-950 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white",
                "file:transition-colors file:hover:bg-neutral-800",
              )}
            />
            {fileName ? (
              <Button
                type="button"
                variant="ghost"
                className="self-start text-neutral-600"
                onClick={resetFile}
              >
                Clear file
              </Button>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-neutral-500">
            <a
              href="/property-import-template.csv"
              className="font-medium text-neutral-950 underline-offset-2 hover:underline"
              download
            >
              Download example CSV
            </a>
          </p>
        </div>

        {previewError ? (
          <div className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
            {previewError}
          </div>
        ) : null}

        {preview?.ok ? (
          <div className="space-y-4 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-6 ring-1 ring-neutral-950/[0.03] sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-neutral-950">
                Import preview
              </h2>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-white px-3 py-1 text-neutral-700 ring-1 ring-neutral-200/80">
                  {preview.totalRows} total rows
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-900 ring-1 ring-emerald-200/80">
                  {preview.validCount} ready to import
                </span>
                {preview.invalidCount > 0 ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-950 ring-1 ring-amber-200/80">
                    {preview.invalidCount} skipped (errors)
                  </span>
                ) : null}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-200/60 bg-white">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/80 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Address</th>
                    <th className="px-3 py-2.5">City</th>
                    <th className="px-3 py-2.5">State</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTableRows.map((row) => (
                    <tr
                      key={row.rowNumber}
                      className="border-b border-neutral-50 last:border-0"
                    >
                      <td className="px-3 py-2 font-mono text-xs tabular-nums text-neutral-500">
                        {row.rowNumber}
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-2 text-neutral-900">
                        {row.address}
                      </td>
                      <td className="px-3 py-2 text-neutral-700">{row.city}</td>
                      <td className="px-3 py-2 text-neutral-700">{row.state}</td>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          <span className="text-xs font-medium text-emerald-700">
                            Valid
                          </span>
                        ) : (
                          <span
                            className="text-xs font-medium text-amber-800"
                            title={row.errorSummary ?? ""}
                          >
                            Invalid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.previewRows.length > PREVIEW_DISPLAY_MAX ? (
              <p className="text-xs text-neutral-500">
                Showing first {PREVIEW_DISPLAY_MAX} of {preview.previewRows.length}{" "}
                rows. All valid rows are imported when you confirm.
              </p>
            ) : null}

            {preview.invalidCount > 0 ? (
              <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-xs text-amber-950">
                <p className="font-medium">Invalid rows (will be skipped)</p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {preview.previewRows
                    .filter((r) => !r.valid)
                    .slice(0, 25)
                    .map((r) => (
                      <li key={r.rowNumber} className="font-mono text-[11px]">
                        Row {r.rowNumber}: {r.errorSummary}
                      </li>
                    ))}
                </ul>
                {preview.invalidCount > 25 ? (
                  <p className="mt-2 text-amber-900/80">
                    …and {preview.invalidCount - 25} more invalid row(s).
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
            {state.error}
          </div>
        ) : null}

        {state.rowErrors?.length ? (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Import issues</p>
            <ul className="mt-2 max-h-48 list-inside list-disc space-y-1 overflow-y-auto text-amber-900">
              {state.rowErrors.map((line) => (
                <li key={line} className="text-xs">
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={!canSubmit} className="min-w-[160px]">
            {pending
              ? "Importing…"
              : preview?.ok
                ? `Import ${preview.validCount} propert${preview.validCount === 1 ? "y" : "ies"}`
                : "Import"}
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/dashboard">Cancel</Link>
          </Button>
        </div>
      </form>

      {preview?.ok && preview.validCount === 0 ? (
        <p className="text-sm text-neutral-500">
          Fix your CSV so at least one row validates, then import again.
        </p>
      ) : null}
    </div>
  );
}
