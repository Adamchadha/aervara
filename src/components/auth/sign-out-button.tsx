"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-9 rounded-lg px-3 text-[13px] font-medium text-stone-900 transition-colors duration-200 hover:bg-neutral-100/80 hover:text-stone-950"
      onClick={handleSignOut}
    >
      Sign out
    </Button>
  );
}
