"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveProperty } from "@/app/properties/actions";
import { Button } from "@/components/ui/button";

type ApprovePropertyButtonProps = {
  propertyId: string;
};

export function ApprovePropertyButton({ propertyId }: ApprovePropertyButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const res = await approveProperty(propertyId);
          if (!res.ok) return;
          router.refresh();
        });
      }}
    >
      {pending ? "Approving..." : "Approve"}
    </Button>
  );
}
