/**
 * Inserts curated example properties for ONE Supabase user (INSERT only).
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Settings → API → service_role — never expose client-side)
 *   SEED_TARGET_USER_ID          (auth.users.id UUID — from Supabase dashboard)
 *
 * Run: npm run seed:examples
 *
 * Dataset: `src/lib/seed-urban-infill-dataset.ts` (22 urban dev sites; Madison + Chicago).
 * Idempotent: if this user already has any row whose notes contain the seed marker,
 * the script exits without inserting (does not touch other users or non-seed rows).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  EXAMPLE_SEED_MARKER,
  getExampleSeedInsertPayloads,
  getExampleSeedRowCount,
} from "../src/lib/seed-example-properties";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const targetUserId = process.env.SEED_TARGET_USER_ID?.trim();

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
    );
    process.exit(1);
  }
  if (!targetUserId) {
    console.error(
      "Set SEED_TARGET_USER_ID to your Supabase auth user UUID (Authentication → Users).",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { count, error: countErr } = await admin
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", targetUserId)
    .ilike("notes", `%${EXAMPLE_SEED_MARKER}%`);

  if (countErr) {
    console.error("Could not check existing seed:", countErr.message);
    process.exit(1);
  }

  if ((count ?? 0) > 0) {
    console.log(
      `This user already has seeded example properties (marker in notes). Skipping.\n` +
        `To re-seed: delete only those rows from the dashboard or SQL, then run again.\n` +
        `Marker: ${EXAMPLE_SEED_MARKER}`,
    );
    process.exit(0);
  }

  const rows = getExampleSeedInsertPayloads(targetUserId);
  const { error } = await admin.from("properties").insert(rows);

  if (error) {
    console.error("Insert failed:", error.message);
    process.exit(1);
  }

  console.log(
    `Inserted ${getExampleSeedRowCount()} example properties for user ${targetUserId}.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
