import { notFound } from "next/navigation";
import { deleteProject, saveProject } from "@/app/(pages)/admin/actions";
import { AdminForm } from "@/components/admin/AdminForm";
import { Checkbox, DeleteForm, EditorHeader, Field, Select, TextArea } from "@/components/admin/fields";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let project: Project | null = null;

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    project = data;
  }

  return (
    <>
      <EditorHeader backHref="/admin/projects" backLabel="Projects" title={project?.title ?? "New project"} />
      <AdminForm action={saveProject} submitLabel={project ? "Save changes" : "Create project"}>
        {project && <input type="hidden" name="id" value={project.id} />}
        <Field label="Title" name="title" required defaultValue={project?.title} />
        <Field
          label="Slug"
          name="slug"
          defaultValue={project?.slug}
          hint="Leave empty to make one from the title."
        />
        <Field label="Subtitle" name="subtitle" defaultValue={project?.subtitle} />
        <TextArea label="Description" name="body" rows={6} defaultValue={project?.body} />
        <Field
          label="Mentors"
          name="mentors"
          defaultValue={project?.mentors}
          hint="Shown under the title, e.g. “Amay Shetty and Anjaneya Damle”."
        />
        <Field
          label="Banner image"
          name="image_url"
          defaultValue={project?.image_url}
          hint="Path such as /images/projects/drone-swarm.webp, or a full URL."
        />
        <Select
          label="Programme"
          name="programme"
          defaultValue={project?.programme ?? ""}
          options={[
            { value: "", label: "None" },
            { value: "spark-26", label: "SPARK 26" },
          ]}
          hint="SPARK entries are listed together under the programme note on /projects."
        />
        <Field
          label="Link"
          name="link_url"
          type="url"
          defaultValue={project?.link_url}
          placeholder="https://github.com/…"
          hint="A repository or external brief, if there is one."
        />
        <Field
          label="Tags"
          name="tags"
          defaultValue={project?.tags.join(", ")}
          hint="Separate with commas."
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Year" name="year" type="number" defaultValue={project?.year} />
          <Field
            label="Order"
            name="sort_order"
            type="number"
            defaultValue={project?.sort_order ?? 0}
            hint="Lower numbers show first."
          />
        </div>
        <Checkbox
          label="Published, show on the public site"
          name="published"
          defaultChecked={project?.published ?? true}
        />
      </AdminForm>
      {project && <DeleteForm action={deleteProject.bind(null, project.id)} label="Delete this project" />}
    </>
  );
}
