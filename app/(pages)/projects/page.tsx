import type { Metadata } from "next";
import { Empty, PageHeader } from "@/components/PageHeader";
import { Survey } from "@/components/projects/Survey";
import { getProjects } from "@/lib/data";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <PageHeader label="Projects" title="What the lab is building">
        Mentor-led builds, open to lab members. Each one runs a full term, from first principles to
        a working demonstration.
      </PageHeader>

      {projects.length === 0 ? <Empty>No projects published yet.</Empty> : <Survey projects={projects} />}
    </>
  );
}
