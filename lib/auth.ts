import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

export interface Viewer {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}

// Cached per request: the layout and the page both ask.
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: data?.full_name ?? null,
    role: (data?.role as Role | undefined) ?? "guest",
  };
});

export function isCoordinator(role: Role | undefined) {
  return role === "coordinator" || role === "admin";
}

// A convenience for the admin pages, not the security boundary — RLS in
// Postgres is. Anyone calling the API directly still gets nothing.
export async function requireCoordinator() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/admin");
  if (!isCoordinator(viewer.role)) redirect("/");
  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireCoordinator();
  if (viewer.role !== "admin") redirect("/admin");
  return viewer;
}
