import Papa from "papaparse";
import { flattenError } from "zod";
import { formatMoney, formatScorePercent } from "@/lib/far-calculations";
import { getDealMemo } from "@/lib/deal-memo";
import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  propertySchema,
  type ParsedProperty,
} from "@/lib/property-form-schema";
import { inferMaxFarFromZoning } from "@/lib/zoning-max-far";
import type { PropertyRow } from "@/types/property";

/** Normalize CSV column header to canonical DB / schema field names. */
export function canonicalCsvHeader(header: string): string {
  const h = header.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    zoning: "zoning_district",
    zoning_district: "zoning_district",
    zoning_code: "zoning_district",
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
    est_rate: "estimated_value_per_sqft",
    construction_cost_per_sqft: "construction_cost_per_sqft",
    hard_cost_per_sqft: "construction_cost_per_sqft",
    soft_cost_percentage: "soft_cost_percentage",
    soft_cost_pct: "soft_cost_percentage",
    soft_pct: "soft_cost_percentage",
    exit_value_per_sqft: "exit_value_per_sqft",
    exit_per_sqft: "exit_value_per_sqft",
    pipeline_status: "status",
    pipeline: "status",
    deal_status: "status",
    status: "status",
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

export type CsvHeaderMappingEntry = {
  csvColumn: string;
  canonicalKey: string;
};

export type CsvParseResult =
  | {
      ok: true;
      rows: Record<string, string>[];
      headerMapping: CsvHeaderMappingEntry[];
      rawHeaders: string[];
    }
  | { ok: false; error: string };

/** Supported columns (human-readable). */
export const CSV_COLUMN_GUIDE =
  "address, city, state, zoning, lot_size, built_sqft, max_far, est_value_per_sqft (optional), status (optional)";

export const MAX_CSV_ROWS = 1500;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function getMaxCsvFileBytes(): number {
  return MAX_FILE_BYTES;
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

/**
 * Parse CSV into canonical-key rows. Preserves original header → field mapping
 * for preview UI.
 */
export function parsePropertyCsv(text: string): CsvParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: "File is empty." };
  }

  const parsed = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (parsed.errors.length > 0) {
    const msg = parsed.errors.map((e) => e.message).join("; ");
    return { ok: false, error: `CSV parse error: ${msg}` };
  }

  const rawHeaders = (parsed.meta.fields ?? [])
    .map((h) => (h ?? "").trim())
    .filter(Boolean);

  const rowsRaw = (parsed.data ?? []).filter((r) =>
    Object.values(r).some((v) => String(v ?? "").trim() !== ""),
  );

  if (rowsRaw.length === 0) {
    return { ok: false, error: "No data rows found (check headers)." };
  }

  if (rowsRaw.length > MAX_CSV_ROWS) {
    return {
      ok: false,
      error: `Too many rows (${rowsRaw.length}). Maximum is ${MAX_CSV_ROWS} per import.`,
    };
  }

  const headerMapping: CsvHeaderMappingEntry[] = rawHeaders.map(
    (csvColumn) => ({
      csvColumn,
      canonicalKey: canonicalCsvHeader(csvColumn),
    }),
  );

  const rows = rowsRaw.map((record) => {
    const canon: Record<string, string> = {};
    for (const h of rawHeaders) {
      const key = canonicalCsvHeader(h);
      const v = record[h];
      canon[key] = v == null ? "" : String(v);
    }
    return normalizeCsvRowStrings(canon);
  });

  const headerKeys = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      if (k.trim()) headerKeys.add(k.trim());
    }
  }

  const missing = CSV_REQUIRED_CANONICAL.filter((key) => !headerKeys.has(key));
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required column(s): ${missing.join(", ")}. Found (canonical): ${Array.from(headerKeys).sort().join(", ") || "none"}`,
    };
  }

  return { ok: true, rows, headerMapping, rawHeaders };
}

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

function cell(raw: Record<string, string>, key: string): string {
  return (raw[key] ?? "").trim();
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
    status: g("status") || undefined,
  };
}

/** Minimal `PropertyRow` for client-side preview of engine + memo (no DB ids). */
export function syntheticPropertyRowFromParsed(
  data: ParsedProperty,
): PropertyRow {
  const resolvedMaxFar =
    data.max_far ?? inferMaxFarFromZoning(data.zoning_district);
  return {
    id: "00000000-0000-0000-0000-000000000001",
    user_id: "00000000-0000-0000-0000-000000000002",
    status: data.status,
    address: data.address,
    city: data.city,
    state: data.state,
    zoning_district: data.zoning_district,
    lot_size_sqft: data.lot_size_sqft,
    built_floor_area_sqft: data.built_floor_area_sqft,
    max_far: resolvedMaxFar,
    notes: data.notes ?? null,
    estimated_value_per_sqft: data.estimated_value_per_sqft ?? null,
    opportunity_value: null,
    current_built_far: null,
    remaining_far: null,
    unused_buildable_sqft: null,
    underbuilt_score: null,
    construction_cost_per_sqft: data.construction_cost_per_sqft ?? null,
    soft_cost_percentage: data.soft_cost_percentage ?? null,
    exit_value_per_sqft: data.exit_value_per_sqft ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export type CsvPreviewRow = {
  rowNumber: number;
  valid: boolean;
  errorSummary: string | null;
  address: string;
  city: string;
  state: string;
  zoning: string;
  lotSize: string;
  builtSqft: string;
  maxFar: string;
  estPerSf: string;
  pipelineStatus: string;
  opportunityLabel: string;
  underbuiltLabel: string;
  recommendedPlay: string;
  memoHint: string;
};

/**
 * Client-safe preview: parse + validate each row (no server calls).
 * Includes modeled opportunity, underbuilt score, play, and memo hint for valid rows.
 */
export function buildCsvImportPreview(text: string):
  | { ok: false; error: string }
  | {
      ok: true;
      previewRows: CsvPreviewRow[];
      totalRows: number;
      validCount: number;
      invalidCount: number;
      headerMapping: CsvHeaderMappingEntry[];
    } {
  const parsed = parsePropertyCsv(text);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  const previewRows: CsvPreviewRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < parsed.rows.length; i++) {
    const rowNum = i + 2;
    const raw = parsed.rows[i]!;
    const zodParsed = propertySchema.safeParse(
      csvRowToPropertySchemaInput(raw),
    );

    const address = cell(raw, "address") || "—";
    const city = cell(raw, "city") || "—";
    const state = cell(raw, "state") || "—";
    const zoning = cell(raw, "zoning_district") || "—";
    const lotSize = cell(raw, "lot_size_sqft") || "—";
    const builtSqft = cell(raw, "built_floor_area_sqft") || "—";
    const maxFar = cell(raw, "max_far") || "—";
    const estPerSf = cell(raw, "estimated_value_per_sqft") || "—";
    const pipelineStatus = cell(raw, "status") || "New";

    if (zodParsed.success) {
      validCount++;
      const synth = syntheticPropertyRowFromParsed(zodParsed.data);
      const read = getOpportunityEngineRead(synth);
      const memo = getDealMemo(synth, read);
      const metrics = getDisplayMetricsForRow(synth);

      previewRows.push({
        rowNumber: rowNum,
        valid: true,
        errorSummary: null,
        address,
        city,
        state,
        zoning,
        lotSize,
        builtSqft,
        maxFar,
        estPerSf,
        pipelineStatus: zodParsed.data.status,
        opportunityLabel: formatMoney(metrics.opportunity_value),
        underbuiltLabel: formatScorePercent(metrics.underbuilt_score),
        recommendedPlay: read.recommendedPlay,
        memoHint: memo.suggestedNextStep,
      });
    } else {
      invalidCount++;
      const msg = flattenError(zodParsed.error).formErrors.join("; ");
      previewRows.push({
        rowNumber: rowNum,
        valid: false,
        errorSummary: msg || "Invalid data",
        address,
        city,
        state,
        zoning,
        lotSize,
        builtSqft,
        maxFar,
        estPerSf,
        pipelineStatus,
        opportunityLabel: "—",
        underbuiltLabel: "—",
        recommendedPlay: "—",
        memoHint: "—",
      });
    }
  }

  return {
    ok: true,
    previewRows,
    totalRows: parsed.rows.length,
    validCount,
    invalidCount,
    headerMapping: parsed.headerMapping,
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
