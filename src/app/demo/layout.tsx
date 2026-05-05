import type { ReactNode } from "react";
import { DemoModeShell } from "@/components/demo/demo-mode-shell";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <DemoModeShell>{children}</DemoModeShell>;
}
