"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

function initials(displayName: string | null, email: string | null): string {
  const s = (displayName ?? "").trim() || (email ?? "").split("@")[0] || "?";
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return s.slice(0, 2).toUpperCase();
}

type ProfileAvatarProps = {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  size?: "sm" | "lg";
  className?: string;
};

export function ProfileAvatar({
  displayName,
  email,
  avatarUrl,
  size = "lg",
  className,
}: ProfileAvatarProps) {
  const letter = useMemo(
    () => initials(displayName, email),
    [displayName, email],
  );

  const canShowImage =
    avatarUrl &&
    (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://"));

  const dim =
    size === "lg"
      ? "h-24 w-24 text-2xl sm:h-28 sm:w-28 sm:text-[1.65rem]"
      : "h-10 w-10 text-xs";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-2xl border border-neutral-200/70 bg-gradient-to-br from-neutral-100 to-neutral-200/90 shadow-inner ring-1 ring-neutral-950/[0.04]",
        dim,
        className,
      )}
    >
      {canShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- user-supplied URL
        <img
          src={avatarUrl}
          alt={displayName ? `Profile photo — ${displayName}` : "Profile photo"}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-semibold tracking-tight text-neutral-700">
          {letter}
        </span>
      )}
    </div>
  );
}
