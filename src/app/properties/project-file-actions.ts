"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ProjectFileCategory } from "@/types/project-file";

const categorySchema = z.enum([
  "floor_plan",
  "zoning_notes",
  "underwriting_notes",
  "concept_visuals",
  "document",
]);

const addSchema = z.object({
  propertyId: z.string().uuid(),
  category: categorySchema,
  title: z.string().trim().min(1).max(200),
  linkUrl: z.string().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

function normalizeHttpUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === "") return null;
  let u: URL;
  try {
    u = new URL(t);
  } catch {
    return "__invalid__";
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return "__invalid__";
  return u.toString();
}

export type ProjectFileActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function addProjectFile(raw: unknown): Promise<ProjectFileActionResult> {
  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid file details." };
  }

  const link = normalizeHttpUrl(parsed.data.linkUrl);
  if (link === "__invalid__") {
    return { ok: false, error: "Link must be a valid http(s) URL." };
  }

  const notes =
    parsed.data.notes == null || parsed.data.notes.trim() === ""
      ? null
      : parsed.data.notes.trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", parsed.data.propertyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (propError || !property) {
    return { ok: false, error: "Property not found." };
  }

  const { error } = await supabase.from("property_project_files").insert({
    property_id: parsed.data.propertyId,
    user_id: user.id,
    category: parsed.data.category as ProjectFileCategory,
    title: parsed.data.title.trim(),
    link_url: link,
    notes,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

const deleteSchema = z.object({
  propertyId: z.string().uuid(),
  fileId: z.string().uuid(),
});

export async function deleteProjectFile(raw: unknown): Promise<ProjectFileActionResult> {
  const parsed = deleteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("property_project_files")
    .delete()
    .eq("id", parsed.data.fileId)
    .eq("property_id", parsed.data.propertyId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
