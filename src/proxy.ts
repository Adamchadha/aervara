/**
 * Next.js 16 request boundary — use this file only.
 *
 * Do **not** add `src/middleware.ts`: Next will error if both `middleware.ts`
 * and `proxy.ts` exist. All auth/session + route guards run via `updateSession`
 * below.
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
