"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type SiteRoomSectionProps = {
  /** Anchor id for deep links / future nav */
  id: string;
  /** e.g. "01" */
  step: string;
  /** Short category label */
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  /** Tighter inner padding for dense blocks */
  density?: "default" | "compact";
};

/**
 * Premium section shell for the property Site Room workspace.
 * Subtle viewport reveal — restrained motion, respects reduced-motion.
 */
export function SiteRoomSection({
  id,
  step,
  label,
  title,
  description,
  children,
  className,
  density = "default",
}: SiteRoomSectionProps) {
  const headingId = `${id}-heading`;
  const pad =
    density === "compact"
      ? "px-6 py-8 sm:px-8 sm:py-9"
      : "px-7 py-10 sm:px-10 sm:py-11 lg:py-12";

  const ref = useRef<HTMLElement>(null);
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

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-20 overflow-hidden rounded-[1.4rem] bg-white/82 backdrop-blur-[2px]",
        "shadow-[0_1px_0_rgba(255,255,255,0.78)_inset,0_22px_64px_-44px_rgba(15,23,42,0.12)]",
        "ring-1 ring-stone-900/[0.04]",
        "will-change-[opacity,transform]",
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-3 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
        "duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:duration-0",
        "[transition-property:opacity,transform]",
        className,
      )}
    >
      <header className="border-b border-stone-200/55 bg-gradient-to-b from-stone-50/45 to-white/85 px-7 py-7 sm:px-10 sm:py-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
          <span className="tabular-nums text-neutral-500">{step}</span>
          <span className="mx-2 text-stone-300">·</span>
          <span>{label}</span>
        </p>
        <h2
          id={headingId}
          className="mt-3 text-[1.1rem] font-semibold tracking-[-0.025em] text-neutral-950 sm:text-[1.35rem]"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-[0.93rem] leading-relaxed text-neutral-500">
            {description}
          </p>
        ) : null}
      </header>
      <div className={cn(pad)}>{children}</div>
    </section>
  );
}
