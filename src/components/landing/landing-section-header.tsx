import { cn } from "@/lib/utils";

type LandingSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

/**
 * Shared marketing typography: eyebrow, display title, optional lead.
 */
export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: LandingSectionHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto max-w-3xl",
        align === "center" && "text-center",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-[1.7rem] font-semibold leading-[1.12] tracking-[-0.028em] text-neutral-950 sm:text-[2rem] sm:leading-[1.1] sm:tracking-[-0.032em] lg:text-[2.125rem]">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 text-[0.9375rem] leading-relaxed text-neutral-600 sm:text-base",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}
