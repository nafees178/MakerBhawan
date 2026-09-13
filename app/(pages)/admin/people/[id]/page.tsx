import { notFound } from "next/navigation";
import { deleteMember, saveMember } from "@/app/(pages)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, DeleteForm, EditorHeader, Field } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";
import type { Member } from "@/lib/types";

export default async function EditMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  let member: Member | null = null;

  if (id !== "new") {
    const { data } = await supabase.from("members").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    member = data;
  }

  const { data: departmentRows } = await supabase.from("members").select("department");
  const departments = [
    ...new Set((departmentRows ?? []).map((r) => r.department as string | null).filter(Boolean)),
  ] as string[];

  return (
    <>
      <EditorHeader backHref="/admin/people" backLabel="People" title={member?.full_name ?? "New person"} />
      <AdminForm action={saveMember} submitLabel={member ? "Save changes" : "Add person"}>
        {member && <input type="hidden" name="id" value={member.id} />}
        <input type="hidden" name="photo_url" value={member?.photo_url ?? ""} />

        <div className="flex items-center gap-5">
          {member?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo_url}
              alt={`Current photo of ${member.full_name}.`}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <span className="h-20 w-20 rounded-full bg-line" />
          )}
          <label className="block">
            <span className="label">{member?.photo_url ? "Replace photo" : "Photo"}</span>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="mt-2 block text-sm text-muted file:mr-3 file:rounded-md file:border file:border-line file:bg-transparent file:px-3 file:py-1.5 file:text-ink"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" name="full_name" required defaultValue={member?.full_name} />
          <Field label="Role" name="role_label" required defaultValue={member?.role_label} placeholder="Core Team" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section" name="department" defaultValue={member?.department} list="departments" />
          <Field
            label="Order"
            name="sort_order"
            type="number"
            defaultValue={member?.sort_order ?? 0}
            hint="Lower numbers show first."
          />
          <datalist id="departments">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" name="linkedin_url" type="url" defaultValue={member?.linkedin_url} />
          <Field label="GitHub" name="github_url" type="url" defaultValue={member?.github_url} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Institute profile"
            name="profile_url"
            type="url"
            defaultValue={member?.profile_url}
            hint="For faculty: their IIT Jodhpur profile page."
          />
          <Field label="Email" name="email" type="email" defaultValue={member?.email} />
        </div>
        <Checkbox
          label="Details pending, show empty photo, LinkedIn and GitHub slots"
          name="is_placeholder"
          defaultChecked={member?.is_placeholder}
        />
        <Checkbox label="Alumni, hide from the current team" name="is_alumni" defaultChecked={member?.is_alumni} />
      </AdminForm>
      {member && <DeleteForm action={deleteMember.bind(null, member.id)} label="Remove this person" />}
    </>
  );
}
