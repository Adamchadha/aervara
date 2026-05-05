import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      disabled,
      asChild = false,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-xl px-5 text-sm font-medium transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/80 focus-visible:ring-offset-2",
          "active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-40",
          variant === "primary" &&
            "bg-neutral-950 text-white shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_14px_-2px_rgba(0,0,0,0.22)] hover:bg-neutral-800 hover:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_8px_28px_-4px_rgba(0,0,0,0.28)]",
          variant === "secondary" &&
            "border border-stone-200/90 bg-white text-neutral-950 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)] hover:border-stone-300/90 hover:bg-stone-50/95 hover:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]",
          variant === "ghost" &&
            "text-neutral-600 hover:bg-stone-100/80 hover:text-neutral-950",
          variant === "destructive" &&
            "border border-red-200/90 bg-white text-red-700 shadow-sm hover:bg-red-50/90",
          className,
        )}
        {...(!asChild ? { type, disabled } : {})}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
