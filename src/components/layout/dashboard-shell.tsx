import Link from "next/link";
import { type ReactNode } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Logo } from "@/components/branding/logo";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo href="/dashboard" variant="nav" priority />
            <nav className="hidden gap-6 text-sm sm:flex">
              <Link
                href="/dashboard"
                className="text-neutral-600 transition-colors hover:text-neutral-950"
              >
                Properties
              </Link>
              <Link
                href="/properties/new"
                className="text-neutral-600 transition-colors hover:text-neutral-950"
              >
                Add property
              </Link>
            </nav>
          </div>
          <SignOutButton />
        </div>
        <nav className="flex gap-4 border-t border-neutral-100 px-4 py-2 text-sm sm:hidden">
          <Link
            href="/dashboard"
            className="text-neutral-600 hover:text-neutral-950"
          >
            Properties
          </Link>
          <Link
            href="/properties/new"
            className="text-neutral-600 hover:text-neutral-950"
          >
            Add property
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
