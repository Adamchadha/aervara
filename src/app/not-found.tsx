import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col bg-[#fafafa]">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
          That URL does not match anything in Aervara. Check the link or head
          back to the home page.
        </p>
        <Button asChild className="mt-10 h-11 rounded-lg px-8 text-sm font-semibold">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    </div>
  );
}
