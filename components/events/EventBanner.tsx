import { cn } from "@/lib/utils";

/**
 * The banner for an event, and the stand-in for one that has no photograph yet.
 *
 * The stand-in is not a grey box with "image" written on it. It is the same
 * engineering grid the hero uses, lit from one corner, carrying the event's
 * initial. That way a page missing its photograph still looks like a finished
 * page, and the day the photograph arrives nothing about the layout moves.
 */
export function EventBanner({
  src,
  alt,
  title,
  ratio = "aspect-[16/9]",
  className,
  priority,
}: {
  src: string | null;
  alt: string;
  title: string;
  ratio?: string;
  className?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-panel", ratio, className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // No photograph yet. The stand-in is deliberately a slim band rather than the
  // full 21:9 the real banner will occupy: an empty box at photo height reads
  // as a broken image and pushes the actual content off the first screen. When
  // the photograph arrives it takes the full ratio and the card grows into it.
  return (
    <div
      role="img"
      aria-label={`${title}. Photograph to follow.`}
      className={cn("relative isolate h-24 overflow-hidden bg-panel sm:h-32", className)}
    >
      <span aria-hidden className="grid-bg absolute inset-0 opacity-70" />
      <span
        aria-hidden
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(247_148_29/0.22),transparent_65%)]"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center font-semibold tracking-tight text-white/[0.06]"
        style={{ fontSize: "clamp(3rem, 9vw, 5.5rem)", lineHeight: 1 }}
      >
        {title.slice(0, 1)}
      </span>
    </div>
  );
}
