import { cn } from "@/lib/utils";

/**
 * Placeholders shown by the route-level loading.tsx files while a page waits on
 * the database.
 *
 * Deliberately not a spinner. These pages are server rendered against Supabase,
 * so the wait is short and variable, and a spinner in that window reads as an
 * error more often than as progress. Blocks in the shape of the page that is
 * coming keep the layout from jumping when it arrives.
 *
 * The shimmer is a background-position animation on a static gradient, so it
 * costs nothing on the main thread, and it stops entirely under
 * prefers-reduced-motion (see globals.css).
 */
export function Bar({ className }: { className?: string }) {
  return <span className={cn("skeleton block h-4 rounded", className)} />;
}

export function Block({ className }: { className?: string }) {
  return <span className={cn("skeleton block rounded-xl", className)} />;
}

/** The header every inner page opens with: label, title, standfirst. */
export function HeaderSkeleton() {
  return (
    <div className="mb-12 max-w-2xl" aria-hidden>
      <Bar className="h-3 w-20" />
      <Bar className="mt-4 h-9 w-[22rem] max-w-full" />
      <Bar className="mt-5 h-4 w-full" />
      <Bar className="mt-2 h-4 w-4/5" />
    </div>
  );
}

/**
 * Wraps a route's placeholder. `aria-busy` plus a polite status line is what a
 * screen reader needs; the blocks themselves are decorative and hidden from it.
 */
export function Loading({ children }: { children: React.ReactNode }) {
  return (
    <div aria-busy="true">
      <p className="sr-only" role="status">
        Loading.
      </p>
      {children}
    </div>
  );
}
