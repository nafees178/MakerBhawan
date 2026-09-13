import type { Metadata } from "next";
import Link from "next/link";
import { Empty, PageHeader } from "@/components/PageHeader";
import { Survey } from "@/components/projects/Survey";
import { getProjects } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Projects",
  description:
    "SPARK 26, the Robotics Society's summer project programme, plus earlier builds from the Anand Rathi Tinkerers' Lab at IIT Jodhpur.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const projects = await getProjects();
  const spark = projects.filter((p) => p.programme === "spark-26");
  const earlier = projects.filter((p) => p.programme !== "spark-26");

  return (
    <>
      <PageHeader label="Projects" title="What the lab is building">
        Mentor-led builds, open to lab members. Each one runs a full term, from first principles to a
        working demonstration.
      </PageHeader>

      {projects.length === 0 && <Empty>No projects published yet.</Empty>}

      {spark.length > 0 && (
        <section aria-labelledby="spark">
          {/*
            The programme has to be explained before the briefs are listed, or a
            reader assumes the lab commissioned four unrelated robots. It is a
            standing note rather than a card: this is context for what follows,
            not an item in the list.
          */}
          <div className="rounded-xl border border-line bg-panel/40 p-7 sm:p-10">
            <p className="font-mono text-sm text-ember">SPARK 26</p>
            <h2 id="spark" className="mt-3 max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              Summer Projects for Advanced Robotics and Kinematics, an initiative of the Robotics
              Society.
            </h2>
            <div className="mt-5 grid max-w-4xl gap-4 text-[1.0625rem] leading-relaxed text-muted sm:grid-cols-2 sm:gap-10">
              <p>
                SPARK releases a set of briefs each year. Every brief is written and run by a student
                mentor, not handed down from a syllabus, and each one is built here in the lab across
                a full term using the machines and stock on these shelves.
              </p>
              <p>
                The {spark.length} briefs released for 2026 are below. Each links through to the full
                write up: what the build has to do, the approach the mentor set out, and the tools it
                is put together with.
              </p>
            </div>
            <p className="mt-7 text-sm text-muted">
              Run by the Robotics Society, IIT Jodhpur. Hosted at the Anand Rathi Tinkerers&apos; Lab.
            </p>
          </div>

          <div className="mt-20">
            <Survey projects={spark} />
          </div>
        </section>
      )}

      {earlier.length > 0 && (
        <section aria-labelledby="earlier" className="mt-28 border-t border-line pt-14">
          <h2 id="earlier" className="text-2xl font-semibold tracking-tight">
            Earlier work
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Builds from before the programme, kept here because the write ups are still useful.
          </p>
          <ul className="mt-10 divide-y divide-line">
            {earlier.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.slug}`} className="group grid gap-2 py-6 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8">
                  <div>
                    <h3 className="text-lg font-medium">
                      {p.title}
                      {p.subtitle && <span className="ml-3 text-muted">{p.subtitle}</span>}
                    </h3>
                    {p.body && <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-muted">{p.body}</p>}
                  </div>
                  <span className="text-sm text-muted transition-colors group-hover:text-ink">
                    Read the brief <span aria-hidden className="text-ember">&rarr;</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
