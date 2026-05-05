import type { ReactNode } from "react";
import { DemoModeShell } from "@/components/demo/demo-mode-shell";
import DashboardShell from "@/components/layout/dashboard-shell";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoModeShell>
      <DashboardShell publicDemo>{children}</DashboardShell>
    </DemoModeShell>
  );
}
