export type Role = "guest" | "student" | "coordinator" | "admin";

export const ROLES: Role[] = ["guest", "student", "coordinator", "admin"];

/** Returned by admin form actions; success redirects instead. */
export interface FormState {
  error?: string;
}

export interface LabEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  description: string | null;
  location: string | null;
  link_url: string | null;
  published: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  tags: string[];
  year: number | null;
  mentors: string | null;
  image_url: string | null;
  sort_order: number;
  published: boolean;
}

export interface Spec {
  label: string;
  value: string;
}

/** What everyone sees: availability, never counts. */
export interface PublicItem {
  id: string;
  code: string;
  name: string;
  variant: string | null;
  category: string;
  description: string | null;
  specs: Spec[];
  image_url: string | null;
  bench_only: boolean;
  available: boolean;
}

/** Coordinators only — RLS returns no rows to anyone else. */
export interface AdminItem extends Omit<PublicItem, "available"> {
  qty_total: number;
  qty_available: number;
}

export interface Member {
  id: string;
  full_name: string;
  role_label: string;
  department: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  /** Institute profile page, used for faculty. */
  profile_url: string | null;
  email: string | null;
  sort_order: number;
  is_alumni: boolean;
  /** Photo and links still to come: render empty slots instead of hiding them. */
  is_placeholder: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  roll_no: string | null;
  role: Role;
  created_at: string;
}
