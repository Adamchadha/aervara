import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/branding/logo";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo href="/" variant="nav" priority />
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-neutral-600 transition-colors hover:text-neutral-950"
              >
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="font-medium text-neutral-950 transition-opacity hover:opacity-70"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
