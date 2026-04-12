import Link from "next/link";
import { cn } from "@/lib/utils";

/** Official wordmark — `public/aervara-logo.svg` */
export const AERVARA_LOGO_PATH = "/aervara-logo.svg";

const INTRINSIC = { width: 1536, height: 1024 };

type LogoProps = {
  /** `auth`: centered lockup (e.g. above login form). */
  variant?: "nav" | "auth";
  href?: string;
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "nav",
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-950",
        variant === "nav" && "mr-3 md:mr-4",
        variant === "auth" && "justify-center",
        className,
      )}
    >
      <img
        src={AERVARA_LOGO_PATH}
        alt="Aervara"
        width={INTRINSIC.width}
        height={INTRINSIC.height}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn(
          "block w-auto object-contain object-left",
          variant === "nav" && "h-14 sm:h-16 md:h-20",
          variant === "auth" && "h-14 sm:h-16 md:h-20",
        )}
      />
    </Link>
  );
}
