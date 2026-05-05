import type { UserProfessionalRole } from "@/types/user-profile";

export type AccessRequestRow = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserProfessionalRole;
  company: string | null;
  city_market: string;
  use_case: string;
  source_route: string;
  requested_from_demo: boolean;
  created_at: string;
};
