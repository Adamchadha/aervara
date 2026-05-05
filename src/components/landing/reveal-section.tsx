"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealSectionProps = {
  children: ReactNode;
  className?: string;
  /** Extra delay when fading in (ms). */
  delayMs?: number;
};

/**
 * Gentle fade-up when the block enters the viewport. Respects reduced motion.
 */
export function RevealSection({
  children,
  className,
  delayMs = 0,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            obs.unobserve(e.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style = {
    transitionDelay: visible ? `${delayMs}ms` : "0ms",
  } satisfies CSSProperties;

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "will-change-[opacity,transform]",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-[14px] opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        "duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0",
        "[transition-property:opacity,transform]",
        className,
      )}
    >
      {children}
    </div>
  );
}
