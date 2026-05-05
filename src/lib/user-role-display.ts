import type { UserProfessionalRole } from "@/types/user-profile";

const ROLES: readonly UserProfessionalRole[] = [
  "developer",
  "investor",
  "broker",
  "acquisition",
  "other",
];

export const USER_ROLE_LABEL: Record<UserProfessionalRole, string> = {
  developer: "Developer",
  investor: "Investor",
  broker: "Broker",
  acquisition: "Acquisition team",
  other: "Other",
};

export function isUserProfessionalRole(
  r: string | null | undefined,
): r is UserProfessionalRole {
  return r != null && ROLES.includes(r as UserProfessionalRole);
}

/** Human-readable role for tables, badges, and copy. */
export function formatUserRoleLabel(role: string | null | undefined): string {
  if (!role?.trim()) return "Member";
  const k = role.trim().toLowerCase();
  if (isUserProfessionalRole(k)) return USER_ROLE_LABEL[k];
  return role
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Subtle badge styles — professional, not loud. */
export function userRoleBadgeToneClass(
  role: string | null | undefined,
): string {
  if (!isUserProfessionalRole(role)) {
    return "border-stone-200/80 bg-stone-50/90 text-neutral-700";
  }
  switch (role) {
    case "developer":
      return "border-slate-200/80 bg-slate-50/95 text-slate-800";
    case "investor":
      return "border-emerald-200/70 bg-emerald-50/90 text-emerald-950";
    case "broker":
      return "border-amber-200/75 bg-amber-50/90 text-amber-950";
    case "acquisition":
      return "border-sky-200/70 bg-sky-50/90 text-sky-950";
    default:
      return "border-stone-200/80 bg-stone-50/90 text-neutral-700";
  }
}

export function dashboardEmptyDescription(role: string | null): string {
  const tail =
    "Capture street address, zoning, lot and built area, max FAR, and optional $ per buildable square foot—Aervara computes underbuilt score and opportunity value automatically.";

  if (!isUserProfessionalRole(role)) {
    return tail;
  }

  const lead: Record<UserProfessionalRole, string> = {
    developer: "Find underbuilt sites worth underwriting.",
    investor: "Find redevelopment opportunities worth backing.",
    broker: "Package better-positioned opportunities with quantified envelope reads.",
    acquisition:
      "Align the team on acquisition targets before partner time stacks up.",
    other: "Screen parcels with a consistent read across your pipeline.",
  };

  return `${lead[role]} ${tail}`;
}
