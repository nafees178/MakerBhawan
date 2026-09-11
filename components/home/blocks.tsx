import Link from "next/link";
import type { PublicItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.02] px-3 py-1 text-xs text-muted">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_10px_rgba(247,148,29,0.9)]" />
      {children}
    </span>
  );
}

export function SectionHead({
  chip,
  a,
  b,
  aside,
}: {
  chip: string;
  a: string;
  b?: string;
  aside?: string;
}) {
  return (
    <div className="mb-12 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
      <div>
        <Chip>{chip}</Chip>
        <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          <span className="block">{a}</span>
          {b && <span className="block text-muted">{b}</span>}
        </h2>
      </div>
      {aside && <p className="max-w-md leading-relaxed text-muted lg:justify-self-end">{aside}</p>}
    </div>
  );
}

export function DeckPanel({
  label,
  title,
  body,
  foot,
  image,
  alt,
  flip,
  imagePosition = "object-center",
  children,
}: {
  label: string;
  title: string;
  body: string;
  foot: React.ReactNode;
  image: string;
  alt: string;
  flip?: boolean;
  /** Tailwind object-position class, for photos whose subject is off-centre. */
  imagePosition?: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="group grid overflow-hidden rounded-2xl border border-line bg-panel/50 lg:grid-cols-2">
      <div className={cn("flex flex-col justify-between gap-10 p-7 sm:p-12", flip && "lg:order-2")}>
        <div>
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ember" />
            {label}
          </p>
          <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">{title}</h3>
          <p className="mt-4 max-w-md leading-relaxed text-muted">{body}</p>
          {children}
        </div>
        <div className="flex items-center gap-3 border-t border-line pt-5 font-mono text-xs text-muted">
          <span aria-hidden className="text-ember">
            +
          </span>
          {foot}
        </div>
      </div>
      <div className="relative min-h-[260px] overflow-hidden lg:min-h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]",
            imagePosition,
          )}
        />
      </div>
    </article>
  );
}

const icons = {
  inventory: "M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4M3 17l9 4 9-4",
  events: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4",
  projects: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  people: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 11a2.5 2.5 0 1 0 0-5M17 14c3 0 5 2 5 5",
};

// A window onto the real inventory, rendered from live data. Everything in it
// that looks like a control is one: visitors tried to click the sidebar.
export function DeviceMock({ items, available, total }: { items: PublicItem[]; available: number; total: number }) {
  const nav = [
    { key: "inventory", label: "Inventory", href: "/inventory", active: true },
    { key: "events", label: "Events", href: "/events" },
    { key: "projects", label: "Projects", href: "/projects" },
    { key: "people", label: "People", href: "/people" },
  ] as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/80 p-2 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="flex items-center gap-1.5 px-3 py-2" aria-hidden>
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 font-mono text-[11px] text-muted">artl · inventory</span>
      </div>
      <div className="grid overflow-hidden rounded-xl border border-line bg-ground sm:grid-cols-[9.5rem_1fr]">
        <nav aria-label="Preview sections" className="hidden border-r border-line p-3 text-[13px] sm:block">
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.key}>
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors",
                    "active" in n ? "bg-white/[0.06] text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink",
                  )}
                >
                  <svg aria-hidden width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icons[n.key]} />
                  </svg>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/inventory" className="group/list block p-4 transition-colors hover:bg-white/[0.02] sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold">
              On the shelves <span aria-hidden className="text-muted transition-colors group-hover/list:text-ember">→</span>
            </p>
            <p className="font-mono text-[11px] text-muted">
              {available}/{total} available
            </p>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {items.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <span className="truncate">
                  {i.name} {i.variant && <span className="text-muted">{i.variant}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted">
                  <span className={cn("h-1.5 w-1.5 rounded-full", i.available ? "bg-ember" : "bg-white/20")} />
                  {i.available ? "Available" : "Out of stock"}
                </span>
              </li>
            ))}
          </ul>
        </Link>
      </div>
    </div>
  );
}
