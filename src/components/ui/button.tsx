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
          "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-40",
          variant === "primary" &&
            "bg-neutral-950 text-white hover:bg-neutral-800",
          variant === "secondary" &&
            "border border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50",
          variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
          variant === "destructive" &&
            "border border-red-200 bg-white text-red-700 hover:bg-red-50",
          className,
        )}
        {...(!asChild ? { type, disabled } : {})}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
