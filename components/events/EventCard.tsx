import Link from "next/link";
import { EventBanner } from "@/components/events/EventBanner";
import type { LabEvent } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** What to print on the date line, in order of how much we actually know. */
export function eventWhen(e: LabEvent) {
  if (e.date_note) return e.date_note;
  if (e.starts_at) return formatDate(e.starts_at);
  return "Dates to be announced";
}

/**
 * Outstation is worth calling out because it changes what taking part costs a
 * student: travel, a squad rather than a drop-in, a season rather than a day.
 */
function Meta({ event }: { event: LabEvent }) {
  const outstation = event.kind === "outstation";
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="font-mono text-sm tabular-nums text-ember">{eventWhen(event)}</span>
      <span className="inline-flex items-center gap-2 text-xs text-muted">
        <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", outstation ? "bg-ember" : "bg-white/30")} />
        {outstation ? "Outstation" : "On campus"}
      </span>
    </div>
  );
}

function More({ title }: { title: string }) {
  return (
    <span className="mt-7 inline-flex items-center gap-2 border-b border-white/25 pb-1 text-sm text-ink transition-colors group-hover:border-ember">
      More about {title}
      <span aria-hidden className="text-ember transition-transform group-hover:translate-x-0.5">
        &rarr;
      </span>
    </span>
  );
}

/**
 * The nearest fixture, set as a panel rather than a tile: the photograph fills
 * the card and the copy sits on top of it, which is the only arrangement where
 * a picture this size still tells you what it belongs to. Everything below the
 * photograph in a stacked card gets pushed off a laptop screen.
 */
function LeadCard({ event }: { event: LabEvent }) {
  const href = event.slug ? `/events/${event.slug}` : null;

  const inner = (
    <>
      {event.image_url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.image_url}
            alt={event.image_alt ?? ""}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover"
          />
          <span aria-hidden className="card-veil absolute inset-0 -z-10" />
        </>
      ) : (
        <>
          <span aria-hidden className="grid-bg absolute inset-0 -z-20 opacity-70" />
          <span
            aria-hidden
            className="absolute -left-24 -top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgb(247_148_29/0.18),transparent_65%)]"
          />
        </>
      )}

      <div className="flex min-h-[24rem] flex-col justify-end p-7 sm:min-h-[26rem] sm:p-10 lg:min-h-[30rem] lg:max-w-2xl lg:p-14">
        <Meta event={event} />
        <h2 className="mt-4 text-3xl font-semibold leading-[1.06] tracking-tight sm:text-4xl lg:text-5xl">
          {event.title}
        </h2>
        {event.summary && (
          <p className="mt-5 max-w-xl leading-relaxed text-ink/75">{event.summary}</p>
        )}
        {event.location && <p className="mt-4 text-sm text-muted">{event.location}</p>}
        {href && <More title={event.title} />}
      </div>
    </>
  );

  const shell =
    "group relative isolate block overflow-hidden rounded-2xl border border-line transition-colors hover:border-white/25";

  return (
    <article className="lg:col-span-2">
      {href ? (
        <Link href={href} className={shell} aria-label={`${event.title}. ${eventWhen(event)}. Read more.`}>
          {inner}
        </Link>
      ) : (
        <div className={shell}>{inner}</div>
      )}
    </article>
  );
}

/**
 * The other two. Photograph on top at a shallower crop, copy below, and the
 * date carried in the same ember mono as the lead so the three read as one set
 * at different weights rather than as three unrelated boxes.
 */
function SideCard({ event }: { event: LabEvent }) {
  const href = event.slug ? `/events/${event.slug}` : null;

  const inner = (
    <>
      <div className="relative overflow-hidden">
        <EventBanner
          src={event.image_url}
          alt={event.image_alt ?? ""}
          title={event.title}
          ratio="aspect-[16/9] max-h-56"
        />
        {/*
          Only the bottom edge, so the banner joins the card without a seam. A
          taller fade washes over whatever is in the middle of the frame: on the
          Sandstone panel that is the summit's own mark, and a logo fading from
          white to grey looks like a bug rather than a treatment.
        */}
        {event.image_url && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(6_6_7/0.92)_0%,transparent_26%)]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        <Meta event={event} />
        <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight">{event.title}</h2>
        {event.summary && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{event.summary}</p>}
        <div className="mt-auto">{href && <More title={event.title} />}</div>
      </div>
    </>
  );

  const shell =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel/40 transition-colors hover:border-white/25";

  return (
    <article className="h-full">
      {href ? (
        <Link href={href} className={shell} aria-label={`${event.title}. ${eventWhen(event)}. Read more.`}>
          {inner}
        </Link>
      ) : (
        <div className={shell}>{inner}</div>
      )}
    </article>
  );
}

export function EventCard({ event, lead }: { event: LabEvent; lead?: boolean }) {
  return lead ? <LeadCard event={event} /> : <SideCard event={event} />;
}
