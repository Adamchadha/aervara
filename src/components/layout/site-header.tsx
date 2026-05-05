import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getEffectiveUserRole } from "@/lib/user-profile-db";
import { UserRoleBadge } from "@/components/ui/user-role-badge";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/branding/logo";

type SiteHeaderProps = {
  /** Public demo (`?demo=true`): send users to the application flow, not pricing. */
  demoAccess?: boolean;
  /**
   * Full `/apply?...` URL for the nav CTA when `demoAccess` is true (preserves
   * demo/next/source). Falls back to `/apply` when omitted.
   */
  accessRequestHref?: string;
};

export async function SiteHeader({
  demoAccess = false,
  accessRequestHref,
}: SiteHeaderProps = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewerRole = user ? await getEffectiveUserRole(supabase, user) : null;

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo href="/" variant="nav" priority />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href={demoAccess ? (accessRequestHref ?? "/apply") : "/pricing"}
            className="rounded-lg px-3 py-2 text-[13px] font-medium tracking-tight text-[#111] transition-[color,background-color,transform] duration-300 ease-out hover:bg-neutral-100/90 hover:text-neutral-950 active:scale-[0.98]"
          >
            {demoAccess ? "Request Full Access" : "Pricing"}
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-[13px] font-medium tracking-tight text-[#111] transition-[color,background-color,transform] duration-300 ease-out hover:bg-neutral-100/90 hover:text-neutral-950 active:scale-[0.98]"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-[13px] font-medium tracking-tight text-[#111] transition-[color,background-color,transform] duration-300 ease-out hover:bg-neutral-100/90 hover:text-neutral-950 active:scale-[0.98]"
              >
                Profile
              </Link>
              {viewerRole ? (
                <UserRoleBadge
                  role={viewerRole}
                  size="xs"
                  className="hidden sm:inline-flex"
                />
              ) : null}
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-[13px] font-medium tracking-tight text-[#111] transition-[color,background-color,transform] duration-300 ease-out hover:bg-neutral-100/80 active:scale-[0.98]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
