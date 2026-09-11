import { AdminList } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, starts_at, location, published")
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (
    <AdminList
      title="Events"
      newHref="/admin/events/new"
      newLabel="New event"
      empty="No events yet."
      rows={data.map((e) => ({
        id: e.id,
        href: `/admin/events/${e.id}`,
        primary: e.title,
        secondary: e.location,
        meta: formatDate(e.starts_at),
        flag: e.published ? null : "Draft",
      }))}
    />
  );
}
