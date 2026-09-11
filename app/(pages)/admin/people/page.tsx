import { AdminList } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPeoplePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, full_name, role_label, department, sort_order, is_alumni")
    .order("sort_order");
  if (error) throw new Error(error.message);

  return (
    <AdminList
      title="People"
      newHref="/admin/people/new"
      newLabel="New person"
      empty="No team members yet."
      rows={data.map((m) => ({
        id: m.id,
        href: `/admin/people/${m.id}`,
        primary: m.full_name,
        secondary: m.role_label,
        meta: m.department,
        flag: m.is_alumni ? "Alumni" : null,
      }))}
    />
  );
}
