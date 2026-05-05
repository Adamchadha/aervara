export function isAccessRequestsTableMissing(error: {
  message?: string;
} | null): boolean {
  const m = error?.message ?? "";
  return (
    m.includes("Could not find the table") ||
    m.includes("schema cache") ||
    m.includes("relation \"public.access_requests\" does not exist") ||
    m.includes("relation 'public.access_requests' does not exist")
  );
}
