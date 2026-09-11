import { notFound } from "next/navigation";
import { deleteEvent, saveEvent } from "@/app/(pages)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, DeleteForm, EditorHeader, Field, TextArea } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";
import type { LabEvent } from "@/lib/types";
import { toIstInput } from "@/lib/utils";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let event: LabEvent | null = null;

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    event = data;
  }

  return (
    <>
      <EditorHeader backHref="/admin/events" backLabel="Events" title={event?.title ?? "New event"} />
      <AdminForm action={saveEvent} submitLabel={event ? "Save changes" : "Create event"}>
        {event && <input type="hidden" name="id" value={event.id} />}
        <Field label="Title" name="title" required defaultValue={event?.title} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Starts (IST)"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toIstInput(event?.starts_at)}
          />
          <Field label="Ends (IST)" name="ends_at" type="datetime-local" defaultValue={toIstInput(event?.ends_at)} />
        </div>
        <Field label="Location" name="location" defaultValue={event?.location} />
        <Field
          label="Link"
          name="link_url"
          type="url"
          defaultValue={event?.link_url}
          placeholder="https://unstop.com/…"
          hint="Registration or details page."
        />
        <TextArea label="Description" name="description" defaultValue={event?.description} />
        <Checkbox label="Published — show on the public site" name="published" defaultChecked={event?.published ?? true} />
      </AdminForm>
      {event && <DeleteForm action={deleteEvent.bind(null, event.id)} label="Delete this event" />}
    </>
  );
}
