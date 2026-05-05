import { cn } from "@/lib/utils";
import {
  formatUserRoleLabel,
  userRoleBadgeToneClass,
} from "@/lib/user-role-display";

type UserRoleBadgeProps = {
  role: string | null | undefined;
  size?: "xs" | "sm" | "md";
  className?: string;
};

/**
 * Compact role pill for profile, deal room, and collaboration surfaces.
 */
export function UserRoleBadge({
  role,
  size = "sm",
  className,
}: UserRoleBadgeProps) {
  const label = formatUserRoleLabel(role);
  const sizing =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : size === "xs"
        ? "px-2 py-0.5 text-[10px]"
        : "px-2.5 py-0.5 text-[11px]";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center rounded-full border font-semibold tracking-tight",
        sizing,
        userRoleBadgeToneClass(role),
        className,
      )}
    >
      {label}
    </span>
  );
}
