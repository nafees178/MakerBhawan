import { notFound } from "next/navigation";
import { deleteItem, saveItem } from "@/app/(pages)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, DeleteForm, EditorHeader, Field, TextArea } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";
import type { AdminItem } from "@/lib/types";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  let item: AdminItem | null = null;

  if (id !== "new") {
    const { data } = await supabase.from("items").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    item = data;
  }

  const { data: categoryRows } = await supabase.from("items").select("category");
  const categories = [...new Set((categoryRows ?? []).map((r) => r.category as string))].sort();

  return (
    <>
      <EditorHeader
        backHref="/admin/inventory"
        backLabel="Inventory"
        title={item ? [item.name, item.variant].filter(Boolean).join(" ") : "New item"}
      />
      <AdminForm action={saveItem} submitLabel={item ? "Save changes" : "Create item"}>
        {item && <input type="hidden" name="id" value={item.id} />}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="name" required defaultValue={item?.name} />
          <Field label="Variant" name="variant" defaultValue={item?.variant} placeholder="e.g. R3, 300 rpm" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Code" name="code" required defaultValue={item?.code} placeholder="ARTL-MC-001" />
          <Field label="Category" name="category" required defaultValue={item?.category} list="categories" />
          <datalist id="categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <TextArea label="Description" name="description" defaultValue={item?.description} />
        <TextArea
          label="Specs"
          name="specs"
          rows={3}
          defaultValue={item?.specs.map((s) => `${s.label}: ${s.value}`).join("\n")}
          hint='One per line, as "Label: value".'
        />

        <fieldset className="space-y-4 border-l border-ember pl-4">
          <legend className="label mb-2">Stock — admin only, never shown publicly</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Total held" name="qty_total" type="number" required defaultValue={item?.qty_total ?? 0} />
            <Field
              label="Available now"
              name="qty_available"
              type="number"
              required
              defaultValue={item?.qty_available ?? 0}
              hint="The public page shows Available when this is above 0."
            />
          </div>
        </fieldset>

        <Checkbox label="Lab use only — cannot leave the lab" name="bench_only" defaultChecked={item?.bench_only} />
      </AdminForm>
      {item && <DeleteForm action={deleteItem.bind(null, item.id)} label="Delete this item" />}
    </>
  );
}
