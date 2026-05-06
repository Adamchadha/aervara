import type { ReactNode } from "react";
import { DemoModeShell } from "@/components/demo/demo-mode-shell";
import { PublicDemoWorkspaceProvider } from "@/components/demo/public-demo-workspace";
import DashboardShell from "@/components/layout/dashboard-shell";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DemoModeShell>
      <DashboardShell publicDemo>
        <PublicDemoWorkspaceProvider>{children}</PublicDemoWorkspaceProvider>
      </DashboardShell>
    </DemoModeShell>
  );
}
