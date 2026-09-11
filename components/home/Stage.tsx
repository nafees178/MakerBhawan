"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Slide {
  tab: string;
  src: string;
  alt: string;
  caption: string;
}

const Arrow = ({ flip }: { flip?: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={flip ? "rotate-180" : undefined}
  >
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

export function Stage({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const go = (n: number) => setActive((n + slides.length) % slides.length);

  return (
    <div>
      <div role="tablist" aria-label="Inside the lab" className="mb-5 flex flex-wrap gap-2">
        {slides.map((s, n) => (
          <button
            key={s.tab}
            role="tab"
            id={`stage-tab-${n}`}
            aria-selected={n === active}
            aria-controls="stage-panel"
            onClick={() => setActive(n)}
            className={cn(
              "min-h-[40px] rounded-full border px-4 text-sm transition-colors duration-200",
              n === active ? "border-ink bg-ink text-ground" : "border-line text-muted hover:border-muted hover:text-ink",
            )}
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div
        id="stage-panel"
        role="tabpanel"
        aria-labelledby={`stage-tab-${active}`}
        className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-panel sm:aspect-[16/9]"
      >
        {slides.map((s, n) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            aria-hidden={n !== active}
            loading={n === 0 ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out",
              n === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
            )}
          />
        ))}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ground/50 via-transparent to-transparent" />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-full border border-line p-1.5">
        <button
          aria-label="Previous photo"
          onClick={() => go(active - 1)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          <Arrow />
        </button>
        <p aria-live="polite" className="text-center text-sm text-muted">
          {slides[active].caption}
        </p>
        <button
          aria-label="Next photo"
          onClick={() => go(active + 1)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink"
        >
          <Arrow flip />
        </button>
      </div>
    </div>
  );
}
