export type Role = "guest" | "student" | "coordinator" | "admin";

export const ROLES: Role[] = ["guest", "student", "coordinator", "admin"];

/** Returned by admin form actions; success redirects instead. */
export interface FormState {
  error?: string;
}

/** 'outstation' means the team travels to it; everything else runs on campus. */
export type EventKind = "campus" | "outstation";

export interface LabEvent {
  id: string;
  slug: string | null;
  title: string;
  kind: EventKind;
  /** Null for an annual fixture whose next date has not been announced. */
  starts_at: string | null;
  ends_at: string | null;
  /** Printed instead of the date when set: "Every 28 February". */
  date_note: string | null;
  /** Two or three sentences. What the card shows. */
  summary: string | null;
  /** Long form, paragraphs separated by a blank line. What the page shows. */
  details: string | null;
  /** Kept for the archived Prometeo rows, which have no summary. */
  description: string | null;
  location: string | null;
  image_url: string | null;
  /** Written per image: two of the three banners are not photos of this lab. */
  image_alt: string | null;
  /** The organiser's own site. */
  link_url: string | null;
  /** The team's public code, where there is any. */
  repo_url: string | null;
  sort_order: number;
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
  /** An external brief or repository, when there is one. */
  link_url: string | null;
  /** The programme it ran under: "spark-26", or null for unaffiliated work. */
  programme: string | null;
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
