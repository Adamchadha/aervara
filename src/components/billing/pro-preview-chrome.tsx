"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DemoPreviewBadge } from "@/components/demo/demo-preview-badge";
import { Button } from "@/components/ui/button";
import { RequestFullAccessLink } from "@/components/navigation/request-full-access-link";

function ProPreviewChromeInner() {
  const sp = useSearchParams();
  if (sp.get("demo") !== "true") return null;

  return (
    <div className="border-b border-sky-100/70 bg-gradient-to-r from-sky-50/50 via-white to-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-10 sm:py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-3">
          <DemoPreviewBadge compact />
          <p className="min-w-0 text-[11px] leading-snug text-neutral-600 sm:text-xs">
            Explore the product in read-only mode—no billing enrollment, no destructive changes.
          </p>
        </div>
        <Button
          asChild
          className="h-8 shrink-0 self-start rounded-lg px-3 text-[11px] font-semibold sm:self-auto sm:text-xs"
        >
          <RequestFullAccessLink>Request Full Access</RequestFullAccessLink>
        </Button>
      </div>
    </div>
  );
}

export function ProPreviewChrome() {
  return (
    <Suspense fallback={null}>
      <ProPreviewChromeInner />
    </Suspense>
  );
}
