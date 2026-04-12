import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url?.trim() || !key?.trim()) {
    throw new Error(
      "Supabase env vars are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then stop and restart `npm run dev`.",
    );
  }

  return createBrowserClient(url, key, {
    // In dev, a singleton can keep using an old key after you change .env.local until a full reload.
    isSingleton: process.env.NODE_ENV === "production",
  });
}
