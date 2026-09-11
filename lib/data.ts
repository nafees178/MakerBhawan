import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { LabEvent, Member, Project, PublicItem } from "@/lib/types";

// Public reads, made as an anonymous visitor (see lib/supabase/public.ts).
// RLS hides unpublished rows from anon, and the queries filter on published too.

export async function getEvents(): Promise<LabEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, starts_at, ends_at, description, location, link_url, published")
    .eq("published", true)
    .order("starts_at", { ascending: false });
  if (error) throw new Error(`events: ${error.message}`);
  return data;
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, slug, title, subtitle, body, tags, year, mentors, image_url, sort_order, published")
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

export function splitEvents(events: LabEvent[], now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = events
    .filter((e) => new Date(e.ends_at ?? e.starts_at) >= startOfToday)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const past = events.filter((e) => new Date(e.ends_at ?? e.starts_at) < startOfToday);
  return { upcoming, past };
}
