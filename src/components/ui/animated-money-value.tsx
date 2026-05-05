"use client";

/* eslint-disable react-hooks/set-state-in-effect -- count-up: layout effect + rAF; sync state updates are intentional */
import {
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { formatMoney } from "@/lib/far-calculations";
import { cn } from "@/lib/utils";

function normalize(amount: number | null | undefined): number | null {
  if (amount == null || !Number.isFinite(Number(amount))) return null;
  return Number(amount);
}

function dollarsEqual(a: number | null, b: number | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return Math.round(a) === Math.round(b);
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

type AnimatedMoneyValueProps = {
  amount: number | null | undefined;
  className?: string;
  /** Duration for count + motion */
  durationMs?: number;
};

/**
 * Formats currency with a subtle ease-out count and light fade/slide when
 * `amount` changes. First paint matches server output (no flash on load).
 */
export function AnimatedMoneyValue({
  amount,
  className,
  durationMs = 460,
}: AnimatedMoneyValueProps) {
  const latestAmountRef = useRef(amount);

  useInsertionEffect(() => {
    latestAmountRef.current = amount;
  }, [amount]);

  const animFromRef = useRef(normalize(amount));
  const [display, setDisplay] = useState<number | null>(() => normalize(amount));
  const [motion, setMotion] = useState({ y: 0, o: 1 });

  useLayoutEffect(() => {
    const end = normalize(amount);
    const start = animFromRef.current;

    if (dollarsEqual(start, end)) {
      animFromRef.current = end;
      setDisplay(end);
      setMotion({ y: 0, o: 1 });
      return;
    }

    let raf = 0;
    let cancelled = false;
    const t0 = performance.now();
    setMotion({ y: 3, o: 0.86 });

    const frame = (now: number) => {
      if (cancelled) return;
      const rawT = Math.min(1, (now - t0) / durationMs);
      const t = easeOutCubic(rawT);
      const mt = easeOutCubic(Math.min(1, rawT * 1.35));
      setMotion({ y: (1 - mt) * 3, o: 0.86 + 0.14 * mt });

      if (start == null && end != null) {
        const from = end * (1 - 0.008);
        const v = from + (end - from) * t;
        setDisplay(v);
        if (rawT < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          setDisplay(end);
          animFromRef.current = end;
          setMotion({ y: 0, o: 1 });
        }
        return;
      }

      if (start != null && end == null) {
        if (rawT < 0.5) {
          setDisplay(start);
          raf = requestAnimationFrame(frame);
        } else if (rawT < 1) {
          setDisplay(null);
          raf = requestAnimationFrame(frame);
        } else {
          animFromRef.current = null;
          setMotion({ y: 0, o: 1 });
        }
        return;
      }

      if (start != null && end != null) {
        const v = start + (end - start) * t;
        setDisplay(v);
        if (rawT < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          setDisplay(end);
          animFromRef.current = end;
          setMotion({ y: 0, o: 1 });
        }
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      animFromRef.current = normalize(latestAmountRef.current);
    };
  }, [amount, durationMs]);

  const text = display == null ? "—" : formatMoney(Math.round(display));

  const style: CSSProperties = {
    opacity: motion.o,
    transform: `translateY(${motion.y}px)`,
  };

  return (
    <span
      className={cn("inline-block will-change-[opacity,transform]", className)}
      style={style}
      aria-live="polite"
    >
      {text}
    </span>
  );
}
