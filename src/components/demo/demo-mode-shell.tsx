"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const DemoToastContext = createContext<(() => void) | null>(null);

export function useDemoToast(): () => void {
  return useContext(DemoToastContext) ?? (() => {});
}

export function DemoModeShell({ children }: { children: ReactNode }) {
  const [toastVisible, setToastVisible] = useState(false);

  const showDemoToast = useCallback(() => {
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 2200);
  }, []);

  return (
    <DemoToastContext.Provider value={showDemoToast}>
      <div
        className="min-h-svh bg-[#fbfaf6] text-stone-900"
        onClickCapture={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("[data-demo-silent]")) return;
          if (
            target.closest(
              "button, a, select, summary, [role='button'], input[type='checkbox']",
            )
          ) {
            showDemoToast();
          }
        }}
      >
        <div
          data-demo-silent
          className="border-b border-stone-200/60 bg-white/85 px-4 py-3 text-center text-sm text-stone-600 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-md sm:px-6"
        >
          <span className="font-semibold tracking-tight text-stone-900">Demo Mode</span>
          <span className="text-stone-500">
            {" "}
            — sample data. Changes are not saved.
          </span>
        </div>
        <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">{children}</div>
        {toastVisible ? (
          <div
            role="status"
            aria-live="polite"
            data-demo-silent
            className="fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 rounded-full border border-stone-200/90 bg-white px-5 py-2 text-sm font-medium text-stone-800 shadow-[0_16px_48px_rgba(15,23,42,0.14)]"
          >
            Demo action
          </div>
        ) : null}
      </div>
    </DemoToastContext.Provider>
  );
}
