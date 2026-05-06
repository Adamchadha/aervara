"use client";

import Link from "next/link";
import { propertyDetailHref } from "@/lib/demo-query";
import { usePublicDemoWorkspace } from "@/components/demo/public-demo-workspace";

type PublicDemoPropertyLinkProps = {
  propertyId: string;
  isDemo?: boolean;
  publicDemo?: boolean;
  /** Full override (e.g. card-level demo detail URL). */
  detailHref?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Resolves `/demo/properties/:id` when `publicDemo` is set or when inside
 * {@link PublicDemoWorkspaceProvider} (the `/demo` layout).
 */
export function PublicDemoPropertyLink({
  propertyId,
  isDemo = false,
  publicDemo = false,
  detailHref,
  className,
  children,
}: PublicDemoPropertyLinkProps) {
  const workspace = usePublicDemoWorkspace();
  const href =
    detailHref ??
    propertyDetailHref(propertyId, {
      isDemo,
      publicDemo: publicDemo || workspace,
    });
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
