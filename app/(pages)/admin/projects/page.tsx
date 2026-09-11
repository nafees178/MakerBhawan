import { AdminList } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, subtitle, year, published, sort_order")
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <AdminList
      title="Projects"
      newHref="/admin/projects/new"
      newLabel="New project"
      empty="No projects yet."
      rows={data.map((p) => ({
        id: p.id,
        href: `/admin/projects/${p.id}`,
        primary: p.title,
        secondary: p.subtitle,
        meta: p.year ? String(p.year) : null,
        flag: p.published ? null : "Draft",
      }))}
    />
  );
}
