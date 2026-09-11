import { AdminList } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  // The base table, not items_public: exact counts are visible here only
  // because RLS lets coordinators read them.
  const { data, error } = await supabase
    .from("items")
    .select("id, code, name, variant, category, qty_total, qty_available")
    .order("category")
    .order("name");
  if (error) throw new Error(error.message);

  return (
    <AdminList
      title="Inventory"
      newHref="/admin/inventory/new"
      newLabel="New item"
      empty="No items yet."
      rows={data.map((i) => ({
        id: i.id,
        href: `/admin/inventory/${i.id}`,
        primary: [i.name, i.variant].filter(Boolean).join(" "),
        secondary: `${i.category} · ${i.code}`,
        meta: `${i.qty_available} / ${i.qty_total}`,
        flag: i.qty_available === 0 ? "Out" : null,
      }))}
    />
  );
}
