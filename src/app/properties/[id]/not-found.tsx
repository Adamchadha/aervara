import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-neutral-950">Property not found</p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        It may have been removed or you don&apos;t have access.
      </p>
      <Button asChild className="mt-8">
        <Link href="/dashboard">Return to dashboard</Link>
      </Button>
    </div>
  );
}
