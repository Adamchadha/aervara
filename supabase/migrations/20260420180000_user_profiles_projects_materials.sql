-- Projects & Materials profile layer (structured placeholders + links).

alter table public.user_profiles
  add column if not exists example_projects text,
  add column if not exists project_notes text,
  add column if not exists brochure_link text,
  add column if not exists deck_link text,
  add column if not exists materials_pdf_link text,
  add column if not exists floor_plan_placeholder text,
  add column if not exists concept_file_placeholder text,
  add column if not exists currently_seeking text;
