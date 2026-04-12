"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { flattenError, z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  computeOpportunityMetrics,
  toStoredDerivedFields,
} from "@/lib/far-calculations";
import {
  getMaxCsvFileBytes,
  parsePropertyCsv,
  validateCsvRowForImport,
} from "@/lib/csv-property-import";
import {
  propertySchema,
  type ParsedProperty,
} from "@/lib/property-form-schema";
import { PROPERTY_STATUSES } from "@/lib/property-status";

const uuidSchema = z.string().uuid("Invalid property id");
const statusSchema = z.enum(PROPERTY_STATUSES);

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

function buildPropertyInsertRow(data: ParsedProperty, userId: string) {
  const {
    notes,
    estimated_value_per_sqft,
    construction_cost_per_sqft,
    soft_cost_percentage,
    exit_value_per_sqft,
    ...rest
  } = data;

  const metrics = computeOpportunityMetrics(
    rest.lot_size_sqft,
    rest.built_floor_area_sqft,
    rest.max_far,
    estimated_value_per_sqft,
  );
  const derived = toStoredDerivedFields(metrics);

  return {
    ...rest,
    notes: notes?.trim() ? notes.trim() : null,
    estimated_value_per_sqft,
    construction_cost_per_sqft,
    soft_cost_percentage,
    exit_value_per_sqft,
    opportunity_value: derived.opportunity_value,
    current_built_far: derived.current_built_far,
    remaining_far: derived.remaining_far,
    unused_buildable_sqft: derived.unused_buildable_sqft,
    underbuilt_score: derived.underbuilt_score,
    user_id: userId,
  };
}

async function insertPropertyForUser(
  supabase: SupabaseServer,
  userId: string,
  data: ParsedProperty,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("properties")
    .insert(buildPropertyInsertRow(data, userId));

  return { error: error?.message ?? null };
}

async function insertPropertiesBatch(
  supabase: SupabaseServer,
  userId: string,
  items: ParsedProperty[],
): Promise<{ error: string | null }> {
  if (items.length === 0) return { error: null };
  const payloads = items.map((d) => buildPropertyInsertRow(d, userId));
  const { error } = await supabase.from("properties").insert(payloads);
  return { error: error?.message ?? null };
}

export type CreatePropertyState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProperty(
  _prev: CreatePropertyState,
  formData: FormData,
): Promise<CreatePropertyState> {
  const parsed = propertySchema.safeParse({
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zoning_district: formData.get("zoning_district"),
    lot_size_sqft: formData.get("lot_size_sqft"),
    built_floor_area_sqft: formData.get("built_floor_area_sqft"),
    max_far: formData.get("max_far"),
    notes: formData.get("notes") || undefined,
    estimated_value_per_sqft: formData.get("estimated_value_per_sqft"),
    construction_cost_per_sqft: formData.get("construction_cost_per_sqft"),
    soft_cost_percentage: formData.get("soft_cost_percentage"),
    exit_value_per_sqft: formData.get("exit_value_per_sqft"),
    status: formData.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error: insertErr } = await insertPropertyForUser(
    supabase,
    user.id,
    parsed.data,
  );

  if (insertErr) {
    return { error: insertErr };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateProperty(
  propertyId: string,
  _prev: CreatePropertyState,
  formData: FormData,
): Promise<CreatePropertyState> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { error: "Invalid property." };
  }

  const parsed = propertySchema.safeParse({
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zoning_district: formData.get("zoning_district"),
    lot_size_sqft: formData.get("lot_size_sqft"),
    built_floor_area_sqft: formData.get("built_floor_area_sqft"),
    max_far: formData.get("max_far"),
    notes: formData.get("notes") || undefined,
    estimated_value_per_sqft: formData.get("estimated_value_per_sqft"),
    construction_cost_per_sqft: formData.get("construction_cost_per_sqft"),
    soft_cost_percentage: formData.get("soft_cost_percentage"),
    exit_value_per_sqft: formData.get("exit_value_per_sqft"),
    status: formData.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const {
    notes,
    estimated_value_per_sqft,
    construction_cost_per_sqft,
    soft_cost_percentage,
    exit_value_per_sqft,
    ...rest
  } = parsed.data;

  const metrics = computeOpportunityMetrics(
    rest.lot_size_sqft,
    rest.built_floor_area_sqft,
    rest.max_far,
    estimated_value_per_sqft,
  );
  const derived = toStoredDerivedFields(metrics);

  const { data: updated, error } = await supabase
    .from("properties")
    .update({
      ...rest,
      notes: notes?.trim() ? notes.trim() : null,
      estimated_value_per_sqft,
      construction_cost_per_sqft,
      soft_cost_percentage,
      exit_value_per_sqft,
      opportunity_value: derived.opportunity_value,
      current_built_far: derived.current_built_far,
      remaining_far: derived.remaining_far,
      unused_buildable_sqft: derived.unused_buildable_sqft,
      underbuilt_score: derived.underbuilt_score,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!updated) {
    return { error: "Property not found or you do not have access." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/properties/${idParsed.data}`);
  revalidatePath(`/properties/${idParsed.data}/edit`);
  redirect("/dashboard");
}

export type UpdatePropertyStatusState = {
  error?: string;
};

export async function updatePropertyStatus(
  propertyId: string,
  _prev: UpdatePropertyStatusState,
  formData: FormData,
): Promise<UpdatePropertyStatusState> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { error: "Invalid property." };
  }

  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!parsed.success) {
    return { error: "Invalid status." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: row, error } = await supabase
    .from("properties")
    .update({
      status: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!row) {
    return { error: "Property not found or you do not have access." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/properties/${idParsed.data}`);
  revalidatePath(`/properties/${idParsed.data}/edit`);
  return {};
}

export type DeletePropertyResult =
  | { success: false; message: string }
  | undefined;

export async function deleteProperty(
  propertyId: string,
): Promise<DeletePropertyResult> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { success: false, message: "Invalid property." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", idParsed.data)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export type ImportCsvState = {
  error?: string;
  rowErrors?: string[];
};

const CSV_IMPORT_CHUNK = 80;
const MAX_ROW_ERROR_LINES = 120;

export async function importPropertiesFromCsv(
  _prev: ImportCsvState,
  formData: FormData,
): Promise<ImportCsvState> {
  const file = formData.get("csv");
  if (!file || !(file instanceof File)) {
    return { error: "Choose a CSV file to upload." };
  }
  if (file.size === 0) {
    return { error: "The file is empty." };
  }
  const maxBytes = getMaxCsvFileBytes();
  if (file.size > maxBytes) {
    return {
      error: `File is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB).`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { error: "Could not read the file." };
  }

  const parsedCsv = parsePropertyCsv(text);
  if (!parsedCsv.ok) {
    return { error: parsedCsv.error };
  }

  const rowErrors: string[] = [];
  const pushRowError = (line: string) => {
    if (rowErrors.length < MAX_ROW_ERROR_LINES) {
      rowErrors.push(line);
    }
  };

  type Queued = { rowNum: number; data: ParsedProperty };
  const queued: Queued[] = [];

  for (let i = 0; i < parsedCsv.rows.length; i++) {
    const rowNum = i + 2;
    const raw = parsedCsv.rows[i];
    const validated = validateCsvRowForImport(raw);
    if (!validated.ok) {
      pushRowError(`Row ${rowNum}: ${validated.message}`);
      continue;
    }
    queued.push({ rowNum, data: validated.data });
  }

  let imported = 0;

  for (let i = 0; i < queued.length; i += CSV_IMPORT_CHUNK) {
    const slice = queued.slice(i, i + CSV_IMPORT_CHUNK);
    const batch = slice.map((s) => s.data);
    const { error: batchErr } = await insertPropertiesBatch(
      supabase,
      user.id,
      batch,
    );

    if (!batchErr) {
      imported += slice.length;
      continue;
    }

    for (const { rowNum, data } of slice) {
      const { error: insertErr } = await insertPropertyForUser(
        supabase,
        user.id,
        data,
      );
      if (insertErr) {
        pushRowError(`Row ${rowNum}: ${insertErr}`);
      } else {
        imported++;
      }
    }
  }

  if (imported === 0) {
    return {
      error: "No properties were imported.",
      rowErrors: rowErrors.length ? rowErrors : undefined,
    };
  }

  revalidatePath("/dashboard");
  const skippedCount = parsedCsv.rows.length - imported;
  const q = new URLSearchParams({ imported: String(imported) });
  if (skippedCount > 0) {
    q.set("skipped", String(skippedCount));
  }
  redirect(`/dashboard?${q.toString()}`);
}
