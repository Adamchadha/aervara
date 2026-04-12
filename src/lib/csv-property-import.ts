import Papa from "papaparse";
import { flattenError } from "zod";
import {
  propertySchema,
  type ParsedProperty,
} from "@/lib/property-form-schema";

/** Normalize CSV column header to canonical DB / schema field names. */
export function canonicalCsvHeader(header: string): string {
  const h = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    zoning: "zoning_district",
    zoning_district: "zoning_district",
    lot_size: "lot_size_sqft",
    lot_size_sqft: "lot_size_sqft",
    lot_sqft: "lot_size_sqft",
    built_floor_area: "built_floor_area_sqft",
    built_floor_area_sqft: "built_floor_area_sqft",
    built_area: "built_floor_area_sqft",
    built_floor: "built_floor_area_sqft",
    built_sqft: "built_floor_area_sqft",
    max_far: "max_far",
    maxfar: "max_far",
    est_value_per_sqft: "estimated_value_per_sqft",
    estimated_value_per_sqft: "estimated_value_per_sqft",
    est_value: "estimated_value_per_sqft",
    value_per_sqft: "estimated_value_per_sqft",
  };
  return map[h] ?? h;
}

export const CSV_REQUIRED_CANONICAL = [
  "address",
  "city",
  "state",
  "zoning_district",
  "lot_size_sqft",
  "built_floor_area_sqft",
  "max_far",
] as const;

export type CsvParseResult =
  | { ok: true; rows: Record<string, string>[] }
  | { ok: false; error: string };

/** Human-readable column names for docs and UI. */
export const CSV_COLUMN_GUIDE =
  "address, city, state, zoning, lot_size, built_sqft, max_far, est_value_per_sqft (optional)";

export const MAX_CSV_ROWS = 500;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function getMaxCsvFileBytes(): number {
  return MAX_FILE_BYTES;
}

/**
 * Parse CSV text into row objects with canonical keys (header transform).
 * Normalizes numeric-looking cells (commas, currency symbols).
 */
export function parsePropertyCsv(text: string): CsvParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "File is empty." };
  }

  const parsed = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: canonicalCsvHeader,
  });

  if (parsed.errors.length > 0) {
    const msg = parsed.errors.map((e) => e.message).join("; ");
    return { ok: false, error: `CSV parse error: ${msg}` };
  }

  const rows = (parsed.data ?? []).filter((r) =>
    Object.values(r).some((v) => String(v ?? "").trim() !== ""),
  );

  if (rows.length === 0) {
    return { ok: false, error: "No data rows found (check headers)." };
  }

  if (rows.length > MAX_CSV_ROWS) {
    return {
      ok: false,
      error: `Too many rows (${rows.length}). Maximum is ${MAX_CSV_ROWS} per import.`,
    };
  }

  const headers = Object.keys(rows[0] ?? {}).map((k) => k.trim());
  const missing = CSV_REQUIRED_CANONICAL.filter(
    (key) => !headers.includes(key),
  );
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column(s): ${missing.join(", ")}. Found headers: ${headers.join(", ")}`,
    };
  }

  const normalized = rows.map((row) => normalizeCsvRowStrings(row));
  return { ok: true, rows: normalized };
}

const NUMERIC_CANONICAL_KEYS = new Set([
  "lot_size_sqft",
  "built_floor_area_sqft",
  "max_far",
  "estimated_value_per_sqft",
  "construction_cost_per_sqft",
  "soft_cost_percentage",
  "exit_value_per_sqft",
]);

/** Remove commas, currency symbols, and extra spaces from known numeric columns. */
export function normalizeCsvRowStrings(
  row: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = { ...row };
  for (const key of Object.keys(out)) {
    if (!NUMERIC_CANONICAL_KEYS.has(key)) continue;
    const v = out[key];
    if (v == null) continue;
    out[key] = String(v)
      .trim()
      .replace(/[$€£]/g, "")
      .replace(/\s+/g, "")
      .replace(/,/g, "");
  }
  return out;
}

/** Shape a CSV row for `propertySchema` (same as server import). */
export function csvRowToPropertySchemaInput(
  row: Record<string, string>,
): Record<string, unknown> {
  const r = normalizeCsvRowStrings(row);
  const g = (k: string) => (r[k] ?? "").trim();
  return {
    address: g("address"),
    city: g("city"),
    state: g("state"),
    zoning_district: g("zoning_district"),
    lot_size_sqft: g("lot_size_sqft"),
    built_floor_area_sqft: g("built_floor_area_sqft"),
    max_far: g("max_far"),
    notes: g("notes") || undefined,
    estimated_value_per_sqft: g("estimated_value_per_sqft"),
    construction_cost_per_sqft: g("construction_cost_per_sqft"),
    soft_cost_percentage: g("soft_cost_percentage"),
    exit_value_per_sqft: g("exit_value_per_sqft"),
  };
}

export type CsvPreviewRow = {
  /** 1-based data row number (line in file after header). */
  rowNumber: number;
  address: string;
  city: string;
  state: string;
  valid: boolean;
  errorSummary: string | null;
};

/**
 * Client-safe preview: parse + validate each row (no server calls).
 */
export function buildCsvImportPreview(text: string):
  | { ok: false; error: string }
  | {
      ok: true;
      previewRows: CsvPreviewRow[];
      totalRows: number;
      validCount: number;
      invalidCount: number;
      headers: string[];
    } {
  const parsed = parsePropertyCsv(text);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const headers = Object.keys(parsed.rows[0] ?? {}).map((k) => k.trim());
  const previewRows: CsvPreviewRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < parsed.rows.length; i++) {
    const rowNum = i + 2;
    const raw = parsed.rows[i];
    const zodParsed = propertySchema.safeParse(
      csvRowToPropertySchemaInput(raw),
    );
    const address = (raw.address ?? "").trim() || "—";
    const city = (raw.city ?? "").trim() || "—";
    const state = (raw.state ?? "").trim() || "—";

    if (zodParsed.success) {
      validCount++;
      previewRows.push({
        rowNumber: rowNum,
        address,
        city,
        state,
        valid: true,
        errorSummary: null,
      });
    } else {
      invalidCount++;
      const msg = flattenError(zodParsed.error).formErrors.join("; ");
      previewRows.push({
        rowNumber: rowNum,
        address,
        city,
        state,
        valid: false,
        errorSummary: msg || "Invalid data",
      });
    }
  }

  return {
    ok: true,
    previewRows,
    totalRows: parsed.rows.length,
    validCount,
    invalidCount,
    headers,
  };
}

export function validateCsvRowForImport(
  row: Record<string, string>,
): { ok: true; data: ParsedProperty } | { ok: false; message: string } {
  const zodParsed = propertySchema.safeParse(csvRowToPropertySchemaInput(row));
  if (!zodParsed.success) {
    const msg = flattenError(zodParsed.error).formErrors.join("; ");
    return { ok: false, message: msg || "Invalid data" };
  }
  return { ok: true, data: zodParsed.data };
}
