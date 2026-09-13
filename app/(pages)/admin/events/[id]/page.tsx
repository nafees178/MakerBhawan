import { notFound } from "next/navigation";
import { deleteEvent, saveEvent } from "@/app/(pages)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, DeleteForm, EditorHeader, Field, Select, TextArea } from "@/components/admin/fields";
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
        <Field
          label="Slug"
          name="slug"
          defaultValue={event?.slug}
          hint="The page address: /events/national-science-day. Leave empty to make one from the title. Changing it breaks existing links."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Kind"
            name="kind"
            defaultValue={event?.kind}
            options={[
              { value: "campus", label: "On campus" },
              { value: "outstation", label: "Outstation (the team travels)" },
            ]}
          />
          <Field
            label="Order"
            name="sort_order"
            type="number"
            defaultValue={event?.sort_order ?? 0}
            hint="Lower numbers show first. The first one is the large card."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Starts (IST)"
            name="starts_at"
            type="datetime-local"
            defaultValue={toIstInput(event?.starts_at)}
            hint="Optional. Leave empty if the date is not settled."
          />
          <Field label="Ends (IST)" name="ends_at" type="datetime-local" defaultValue={toIstInput(event?.ends_at)} />
        </div>

        <Field
          label="Date note"
          name="date_note"
          defaultValue={event?.date_note}
          placeholder="Every 28 February"
          hint="Printed instead of the date above, when set. Use it for annual fixtures and for “Dates to be announced”."
        />

        <Field label="Location" name="location" defaultValue={event?.location} />

        <TextArea
          label="Summary"
          name="summary"
          rows={3}
          defaultValue={event?.summary}
          hint="Two or three sentences. This is the card on /events, and the description search engines show."
        />

        <TextArea
          label="Details"
          name="details"
          rows={14}
          defaultValue={event?.details}
          hint="The event's own page. Separate paragraphs with a blank line."
        />

        <Field
          label="Banner image"
          name="image_url"
          defaultValue={event?.image_url}
          placeholder="/images/events/national-science-day.webp"
          hint="Path under /public or a full URL. Left empty, the card draws a patterned stand-in instead of looking broken."
        />

        <Field
          label="Banner description"
          name="image_alt"
          defaultValue={event?.image_alt}
          placeholder="A prism splitting a beam of light into a spectrum."
          hint="Read aloud to anyone who cannot see the banner. Describe the picture, not the event."
        />

        <Field
          label="Link"
          name="link_url"
          type="url"
          defaultValue={event?.link_url}
          placeholder="https://ddrobocon.iitd.ac.in/"
          hint="The organiser's own site, if there is one."
        />

        <Field
          label="Repository"
          name="repo_url"
          type="url"
          defaultValue={event?.repo_url}
          placeholder="https://github.com/RoboticsClubIITJ"
          hint="Public code from the team, if there is any."
        />

        <Checkbox label="Published, show on the public site" name="published" defaultChecked={event?.published ?? true} />
      </AdminForm>
      {event && <DeleteForm action={deleteEvent.bind(null, event.id)} label="Delete this event" />}
    </>
  );
}
