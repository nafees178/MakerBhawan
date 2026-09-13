import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { LabEvent, Member, Project, PublicItem } from "@/lib/types";

// Public reads, made as an anonymous visitor (see lib/supabase/public.ts).
// RLS hides unpublished rows from anon, and the queries filter on published too.

const EVENT_COLUMNS =
  "id, slug, title, kind, starts_at, ends_at, date_note, summary, details, description, location, image_url, image_alt, link_url, repo_url, sort_order, published";

export async function getEvents(): Promise<LabEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("published", true)
    .order("sort_order")
    .order("starts_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`events: ${error.message}`);
  return data;
}

const PROJECT_COLUMNS =
  "id, slug, title, subtitle, body, tags, year, mentors, image_url, link_url, programme, sort_order, published";

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`projects: ${error.message}`);
  return data;
}

export async function getInventory(): Promise<PublicItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("items_public")
    .select("id, code, name, variant, category, description, specs, image_url, bench_only, available")
    .order("category")
    .order("name");
  if (error) throw new Error(`inventory: ${error.message}`);
  return data as PublicItem[];
}

export async function getMembers(): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("members")
    .select(
      "id, full_name, role_label, department, photo_url, linkedin_url, github_url, profile_url, email, sort_order, is_alumni, is_placeholder",
    )
    .order("sort_order");
  if (error) throw new Error(`members: ${error.message}`);
  return data;
}

/** One published event by slug, for /events/[slug]. */
export async function getEvent(slug: string): Promise<LabEvent | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`event ${slug}: ${error.message}`);
  return data;
}

/** One published project by slug, for /projects/[slug]. */
export async function getProject(slug: string): Promise<Project | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`project ${slug}: ${error.message}`);
  return data;
}

/**
 * Splits on date where there is one. An event with no announced date is not
 * past, so it sits with the upcoming set rather than falling off the page.
 */
export function splitEvents(events: LabEvent[], now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const ended = (e: LabEvent) => {
    const at = e.ends_at ?? e.starts_at;
    return at !== null && new Date(at) < startOfToday;
  };
  return { upcoming: events.filter((e) => !ended(e)), past: events.filter(ended) };
}
