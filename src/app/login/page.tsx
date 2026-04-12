import { Suspense } from "react";
import { Logo } from "@/components/branding/logo";
import { SiteHeader } from "@/components/layout/site-header";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="mb-8 flex w-full max-w-sm justify-center sm:mb-10">
          <Logo href="/" variant="auth" priority />
        </div>
        <Suspense fallback={<div className="h-64 w-full max-w-sm animate-pulse rounded-lg bg-neutral-100" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
