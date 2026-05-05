"use client";

import Link from "next/link";
import { Suspense, useMemo, type ComponentProps } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { requestFullAccessHref } from "@/lib/demo-flow";
import { withDemoQuery } from "@/lib/demo-query";

export type RequestFullAccessLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /**
   * Post-approval return path (e.g. `/properties/abc`). When the current URL has
   * `demo=true`, it is appended to this path.
   */
  returnToPath?: string;
};

function RequestFullAccessLinkInner({
  returnToPath,
  children,
  ...linkProps
}: RequestFullAccessLinkProps) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const href = useMemo(() => {
    const q = sp.toString();
    const pathWithQuery = q ? `${pathname}?${q}` : pathname;
    const isDemo = sp.get("demo") === "true";
    const next =
      returnToPath != null && returnToPath.trim() !== ""
        ? withDemoQuery(returnToPath.trim(), isDemo)
        : pathWithQuery;
    return requestFullAccessHref({ nextPath: next, sourceRoute: pathWithQuery });
  }, [pathname, sp, returnToPath]);

  return (
    <Link href={href} {...linkProps}>
      {children}
    </Link>
  );
}

/**
 * Link to `/apply` with `next` + `source` derived from the current URL (and optional
 * `returnToPath`). Wraps `useSearchParams` in `Suspense` for static routes.
 */
export function RequestFullAccessLink({
  returnToPath,
  children,
  ...linkProps
}: RequestFullAccessLinkProps) {
  const trimmed = returnToPath?.trim();
  const fallbackHref =
    trimmed && trimmed.length > 0
      ? requestFullAccessHref({ nextPath: trimmed, sourceRoute: trimmed })
      : "/apply";

  return (
    <Suspense fallback={<Link href={fallbackHref} {...linkProps}>{children}</Link>}>
      <RequestFullAccessLinkInner returnToPath={returnToPath} {...linkProps}>
        {children}
      </RequestFullAccessLinkInner>
    </Suspense>
  );
}
