import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[100px] w-full rounded-xl border border-stone-200/90 bg-white px-3.5 py-3 text-sm text-neutral-950 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-[border-color,box-shadow,background-color] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        "placeholder:text-neutral-400",
        "focus-visible:outline-none focus-visible:border-stone-300/90 focus-visible:ring-2 focus-visible:ring-neutral-950/15 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";
