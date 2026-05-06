"use client";

import { createContext, useContext, type ReactNode } from "react";

const PublicDemoWorkspaceContext = createContext(false);

/** Wrap `/demo` routes so property links resolve to `/demo/properties/:id`. */
export function PublicDemoWorkspaceProvider({ children }: { children: ReactNode }) {
  return (
    <PublicDemoWorkspaceContext.Provider value={true}>
      {children}
    </PublicDemoWorkspaceContext.Provider>
  );
}

/** True when rendered inside the public `/demo` workspace (list + detail). */
export function usePublicDemoWorkspace(): boolean {
  return useContext(PublicDemoWorkspaceContext);
}
