import type { ReactNode } from "react";
import { ArchitecturalBackdrop } from "@/components/layout/architectural-backdrop";

/** Dashboard route atmosphere — delegates to architectural backdrop system. */
export function DashboardAtmosphere({ children }: { children: ReactNode }) {
  return <ArchitecturalBackdrop>{children}</ArchitecturalBackdrop>;
}
