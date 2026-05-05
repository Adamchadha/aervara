import { NextResponse } from "next/server";
import { ensureUserProfileFromAuth } from "@/lib/ensure-user-profile";
import { createClient } from "@/lib/supabase/server";
import { getSafeInternalRedirect } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextPath = getSafeInternalRedirect(
    url.searchParams.get("next"),
    "/dashboard",
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await ensureUserProfileFromAuth(supabase, user);
      }
      return NextResponse.redirect(new URL(nextPath, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin));
}
