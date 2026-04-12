import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { nominatimGeocode, nominatimUserAgent } from "@/lib/nominatim-geocode";

const bodySchema = z.object({
  propertyIds: z.array(z.string().uuid()).min(1).max(35),
});

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Geocode the caller's properties by id. Addresses are read from the database
 * (RLS). Serialized ~1 req/s for Nominatim.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { propertyIds } = parsed.data;

  const { data: rows, error } = await supabase
    .from("properties")
    .select("id, address, city, state")
    .in("id", propertyIds)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows?.length) {
    return NextResponse.json({ results: {} });
  }

  const ua = nominatimUserAgent();
  const results: Record<string, { lat: number; lng: number } | null> = {};

  for (let i = 0; i < rows.length; i++) {
    if (i > 0) {
      await sleep(1100);
    }
    const row = rows[i];
    const query = `${row.address}, ${row.city}, ${row.state}`;
    try {
      const hit = await nominatimGeocode(query, ua);
      results[row.id] = hit;
    } catch {
      results[row.id] = null;
    }
  }

  return NextResponse.json({ results });
}
