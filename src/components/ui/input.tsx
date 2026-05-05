import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-stone-200/90 bg-white px-3.5 text-sm text-neutral-950 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow,background-color] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "placeholder:text-neutral-400",
        "focus-visible:border-stone-300/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/15 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
