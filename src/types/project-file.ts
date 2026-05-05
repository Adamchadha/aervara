export type ProjectFileCategory =
  | "floor_plan"
  | "zoning_notes"
  | "underwriting_notes"
  | "concept_visuals"
  | "document";

export type ProjectFileRow = {
  id: string;
  category: ProjectFileCategory;
  title: string;
  link_url: string | null;
  notes: string | null;
  created_at: string;
};
