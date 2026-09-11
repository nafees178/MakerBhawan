import type { Metadata } from "next";
import { Empty, PageHeader, SectionTitle } from "@/components/PageHeader";
import { getEvents, splitEvents } from "@/lib/data";
import type { LabEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Events" };

function EventRow({ event }: { event: LabEvent }) {
  return (
    <li className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr_auto] sm:items-baseline sm:gap-6">
      <span className="font-mono text-sm tabular-nums text-muted">{formatDate(event.starts_at)}</span>
      <div>
        <p className="font-medium">{event.title}</p>
        {event.description && <p className="mt-1 text-sm text-muted">{event.description}</p>}
        {event.location && <p className="label mt-1">{event.location}</p>}
      </div>
      {event.link_url ? (
        <a className="link text-sm text-muted" href={event.link_url} target="_blank" rel="noopener noreferrer">
          Details ↗
        </a>
      ) : (
        <span />
      )}
    </li>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = splitEvents(await getEvents());

  return (
    <>
      <PageHeader label="Events" title="Calendar">
        Competitions, workshops and sessions run by the lab.
      </PageHeader>

      <div className="space-y-14">
        <section>
          <SectionTitle count={upcoming.length}>Upcoming</SectionTitle>
          {upcoming.length === 0 ? (
            <Empty>Nothing scheduled right now. Check back soon.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle count={past.length}>Past</SectionTitle>
          {past.length === 0 ? (
            <Empty>No past events yet.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {past.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
