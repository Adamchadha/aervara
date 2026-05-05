export const SITE_VISIT_CHECKLIST_ITEMS = [
  {
    id: "surrounding_density",
    label: "Surrounding density",
    hint: "Massing, height steps, and how the block reads from the curb.",
  },
  {
    id: "neighboring_buildings",
    label: "Neighboring buildings",
    hint: "Conditions, uses, and party-wall or daylight implications.",
  },
  {
    id: "access_points",
    label: "Access points",
    hint: "Driveways, alleys, curb cuts, loading, and pedestrian flow.",
  },
  {
    id: "zoning_context",
    label: "Zoning context",
    hint: "District character on the ground—signage, setbacks you can observe.",
  },
  {
    id: "current_use",
    label: "Current use",
    hint: "Occupancy, parking pattern, and obvious operational constraints.",
  },
] as const;

export type SiteVisitChecklistId = (typeof SITE_VISIT_CHECKLIST_ITEMS)[number]["id"];

const ALLOWED = new Set<string>(
  SITE_VISIT_CHECKLIST_ITEMS.map((i) => i.id),
);

export function defaultSiteVisitChecklist(): Record<SiteVisitChecklistId, boolean> {
  return Object.fromEntries(
    SITE_VISIT_CHECKLIST_ITEMS.map((i) => [i.id, false]),
  ) as Record<SiteVisitChecklistId, boolean>;
}

export function parseSiteVisitChecklist(raw: unknown): Record<SiteVisitChecklistId, boolean> {
  const out = defaultSiteVisitChecklist();
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    for (const id of ALLOWED) {
      if (id in o) {
        out[id as SiteVisitChecklistId] = Boolean(o[id]);
      }
    }
  }
  return out;
}
