"use client";

import dynamic from "next/dynamic";
import type { PropertiesMapViewProps } from "./properties-map-view-inner";

const PropertiesMapViewClient = dynamic(
  () => import("./properties-map-view-inner"),
  {
    ssr: false,
    loading: () => (
      <div
        className="aervara-map-root flex h-[min(72vh,580px)] w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 text-sm text-neutral-500 shadow-[0_2px_12px_rgba(15,23,42,0.06)] ring-1 ring-neutral-950/[0.04]"
        role="status"
        aria-live="polite"
      >
        Loading map…
      </div>
    ),
  },
);

export type { PropertiesMapViewProps };

export function PropertiesMapView(props: PropertiesMapViewProps) {
  return <PropertiesMapViewClient {...props} />;
}
