import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventBanner } from "@/components/events/EventBanner";
import { eventWhen } from "@/components/events/EventCard";
import { Prose } from "@/components/Prose";
import { getEvent, getEvents } from "@/lib/data";
import { absolute, pageMeta } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

/** Three rows. Pre-rendering them costs nothing and makes the pages instant. */
export async function generateStaticParams() {
  const events = await getEvents();
  return events.filter((e) => e.slug).map((e) => ({ slug: e.slug! }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };

  return pageMeta({
    title: event.title,
    // The summary is written as two or three sentences, which is the length a
    // description wants anyway. Trimmed only if an editor writes a long one.
    description: (event.summary ?? `${event.title} at the Anand Rathi Tinkerers' Lab, IIT Jodhpur.`).slice(0, 200),
    path: `/events/${event.slug}`,
    image: event.image_url ?? undefined,
  });
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const when = eventWhen(event);

  return (
    <article>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <Link href="/events" className="text-muted transition-colors hover:text-ink">
          <span aria-hidden>&larr;</span> All events
        </Link>
      </nav>

      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-mono text-sm tabular-nums text-ember">{when}</span>
          <span className="text-sm text-muted">
            {event.kind === "outstation" ? "Outstation" : "On campus"}
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">{event.title}</h1>
        {event.summary && <p className="mt-6 text-lg leading-relaxed text-muted">{event.summary}</p>}
      </header>

      <div className="mt-12">
        <EventBanner
          src={event.image_url}
          alt={event.image_alt ?? ""}
          title={event.title}
          ratio="aspect-[16/9] lg:aspect-[21/9]"
          className="rounded-xl"
          priority
        />
      </div>

      <div className="mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div className="max-w-[68ch]">
          {event.details ? (
            <Prose text={event.details} />
          ) : (
            <p className="text-muted">Details for this event are still being written.</p>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <dl className="space-y-6 border-t border-line pt-6 text-sm">
            <div>
              <dt className="text-muted">When</dt>
              <dd className="mt-1">{when}</dd>
            </div>
            {event.location && (
              <div>
                <dt className="text-muted">Where</dt>
                <dd className="mt-1">{event.location}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">Format</dt>
              <dd className="mt-1">
                {event.kind === "outstation"
                  ? "The team travels. A season of work here, a few days there."
                  : "On the IIT Jodhpur campus, open to the institute."}
              </dd>
            </div>
          </dl>

          {(event.link_url || event.repo_url) && (
            <div className="mt-8 space-y-3">
              {event.link_url && (
                <a href={event.link_url} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
                  Official site
                  <span aria-hidden className="ml-2">
                    &#8599;
                  </span>
                </a>
              )}
              {event.repo_url && (
                <a href={event.repo_url} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full">
                  Team code on GitHub
                  <span aria-hidden className="ml-2">
                    &#8599;
                  </span>
                </a>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Structured data, so a search result for the event carries its date and
          place rather than just the page title. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.summary ?? undefined,
            url: absolute(`/events/${event.slug}`),
            ...(event.starts_at ? { startDate: event.starts_at } : {}),
            ...(event.ends_at ? { endDate: event.ends_at } : {}),
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            location: { "@type": "Place", name: event.location ?? "IIT Jodhpur" },
            organizer: { "@type": "Organization", name: "Anand Rathi Tinkerers' Lab, IIT Jodhpur" },
          }),
        }}
      />
    </article>
  );
}
