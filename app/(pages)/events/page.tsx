import type { Metadata } from "next";
import { EventCard } from "@/components/events/EventCard";
import { Empty, PageHeader } from "@/components/PageHeader";
import { getEvents, splitEvents } from "@/lib/data";
import { pageMeta } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Events",
  description:
    "National Science Day, the Sandstone Summit and Robocon: what the Anand Rathi Tinkerers' Lab at IIT Jodhpur runs, and what it travels for.",
  path: "/events",
});

export default async function EventsPage() {
  const { upcoming, past } = splitEvents(await getEvents());
  const [lead, ...rest] = upcoming;

  return (
    <>
      {/* A warm bloom behind the masthead. The page is otherwise near-black from
          edge to edge, and three dark cards on a dark ground read as a list of
          boxes rather than as a page. */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-[24rem] w-[44rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(247_148_29/0.11),transparent_66%)]"
        />
        <PageHeader label="Events" title="Three fixtures worth planning around">
          Two run on this campus and one takes the team off it. Each has a page of its own with the
          detail: what it is, what the lab does there, and how to take part.
        </PageHeader>
      </div>

      {upcoming.length === 0 ? (
        <Empty>Nothing published yet. Check back soon.</Empty>
      ) : (
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {lead && <EventCard event={lead} lead />}
          {rest.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 border-b border-line pb-3 text-sm text-muted">
            Previously ({past.length})
          </h2>
          <ul className="divide-y divide-line">
            {past.map((e) => (
              <li key={e.id} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                <span className="font-mono text-sm tabular-nums text-muted">
                  {e.starts_at ? new Date(e.starts_at).getFullYear() : ""}
                </span>
                <div>
                  <p className="font-medium">{e.title}</p>
                  {e.summary ?? e.description ? (
                    <p className="mt-1 text-sm text-muted">{e.summary ?? e.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
