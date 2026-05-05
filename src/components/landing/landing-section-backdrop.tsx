import { cn } from "@/lib/utils";

/**
 * Optional blueprint-style grid wash behind marketing sections.
 */
export function LandingSectionBackdrop({
  className,
  intensity = "subtle",
}: {
  className?: string;
  intensity?: "subtle" | "whisper";
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 aervara-marketing-grid",
        intensity === "subtle" ? "opacity-[0.42]" : "opacity-[0.22]",
        className,
      )}
      aria-hidden
    />
  );
}
