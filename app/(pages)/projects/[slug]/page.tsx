import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { getProject, getProjects } from "@/lib/data";
import { absolute, pageMeta } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found" };

  const description = (project.body ?? project.subtitle ?? `${project.title}, built at the Anand Rathi Tinkerers' Lab.`)
    .slice(0, 200)
    .trim();

  return pageMeta({
    title: project.title,
    description,
    path: `/projects/${project.slug}`,
    image: project.image_url ?? undefined,
  });
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const isSpark = project.programme === "spark-26";

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <Link href="/projects" className="text-muted transition-colors hover:text-ink">
          <span aria-hidden>&larr;</span> All projects
        </Link>
      </nav>

      <header className="max-w-3xl">
        {isSpark && (
          <p className="font-mono text-sm text-ember">
            <Link href="/projects#spark" className="transition-colors hover:text-ink">
              SPARK 26
            </Link>
          </p>
        )}
        <h1 className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">{project.title}</h1>
        {project.subtitle && <p className="mt-4 text-lg text-muted">{project.subtitle}</p>}
      </header>

      {project.image_url && (
        <figure className="mt-12 overflow-hidden rounded-xl bg-panel">
          <div className="aspect-[16/9] lg:aspect-[21/9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image_url}
              alt={`${project.title}: ${project.subtitle ?? "project banner"}.`}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </figure>
      )}

      <div className="mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div className="max-w-[68ch]">
          {project.body ? <Prose text={project.body} /> : <p className="text-muted">The brief for this build is still being written.</p>}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <dl className="space-y-6 border-t border-line pt-6 text-sm">
            {project.mentors && (
              <div>
                <dt className="text-muted">Mentored by</dt>
                <dd className="mt-1">{project.mentors}</dd>
              </div>
            )}
            {project.year && (
              <div>
                <dt className="text-muted">Year</dt>
                <dd className="mt-1 font-mono tabular-nums">{project.year}</dd>
              </div>
            )}
            {isSpark && (
              <div>
                <dt className="text-muted">Programme</dt>
                <dd className="mt-1">SPARK 26, Robotics Society, IIT Jodhpur</dd>
              </div>
            )}
            {project.tags.length > 0 && (
              <div>
                <dt className="text-muted">Built with</dt>
                <dd className="mt-2">
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-muted/85">
                    {project.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {project.link_url && (
            <a href={project.link_url} target="_blank" rel="noopener noreferrer" className="btn-ghost mt-8 w-full">
              Project repository
              <span aria-hidden className="ml-2">
                &#8599;
              </span>
            </a>
          )}

          <p className="mt-8 text-sm leading-relaxed text-muted">
            Want in on a build like this?{" "}
            <Link href="/signup" className="link text-ink">
              Sign up with your IITJ email
            </Link>{" "}
            and talk to a coordinator.
          </p>
        </aside>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            abstract: project.subtitle ?? undefined,
            url: absolute(`/projects/${project.slug}`),
            ...(project.year ? { dateCreated: String(project.year) } : {}),
            ...(project.mentors ? { contributor: project.mentors } : {}),
            publisher: { "@type": "Organization", name: "Anand Rathi Tinkerers' Lab, IIT Jodhpur" },
          }),
        }}
      />
    </article>
  );
}
