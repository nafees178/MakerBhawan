"use client";

import { useEffect, useRef } from "react";
import { onScrollFrame, reducedMotion } from "@/components/home/motion";
import type { Project } from "@/lib/types";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/*
 * Three of these four projects compute a path through space that a machine then
 * follows, so the page is laid out as one: a single trajectory down the left
 * edge, with each project a waypoint on it. The line draws as you scroll and a
 * waypoint latches once you reach it, which is the page reporting its own
 * position the way the robots report theirs.
 *
 * Each banner sits dark until the trajectory arrives, then resolves. Only
 * opacity and transform move, so the work stays on the compositor: the dark
 * state is a separate veil layer rather than a filter on the image.
 */
export function Survey({ projects }: { projects: Project[] }) {
  const list = useRef<HTMLOListElement>(null);
  const trail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = list.current;
    if (!root) return;

    const plates = [...root.querySelectorAll<HTMLElement>("[data-plate]")];
    const veils = plates.map((p) => p.querySelector<HTMLElement>("[data-veil]"));
    const shots = plates.map((p) => p.querySelector<HTMLElement>("[data-shot]"));
    const nodes = [...root.querySelectorAll<HTMLElement>("[data-node]")];

    if (reducedMotion()) {
      veils.forEach((v) => v && (v.style.opacity = "0"));
      shots.forEach((s) => s && (s.style.transform = "none"));
      nodes.forEach((n) => n.classList.add("is-passed"));
      if (trail.current) trail.current.style.transform = "scaleY(1)";
      return;
    }

    return onScrollFrame(() => {
      const h = window.innerHeight;

      plates.forEach((plate, n) => {
        // 0 while the banner is still below the fold, 1 once it has climbed to
        // reading height. Resolving across 45% of a screen keeps it unhurried.
        const t = clamp((h * 0.92 - plate.getBoundingClientRect().top) / (h * 0.45));
        const veil = veils[n];
        const shot = shots[n];
        if (veil) veil.style.opacity = String(0.82 * (1 - t));
        if (shot) shot.style.transform = `scale(${1 + 0.05 * (1 - t)})`;
      });

      for (const node of nodes) {
        node.classList.toggle("is-passed", node.getBoundingClientRect().top < h * 0.62);
      }

      const box = root.getBoundingClientRect();
      if (trail.current) {
        trail.current.style.transform = `scaleY(${clamp((h * 0.62 - box.top) / Math.max(1, box.height))})`;
      }
    });
  }, []);

  return (
    <ol ref={list} className="relative space-y-28 sm:space-y-36 lg:pl-20">
      {/* The trajectory. Hidden below lg, where there is no gutter to hold it. */}
      <div aria-hidden className="absolute left-4 top-0 hidden h-full w-px bg-line lg:block">
        <div ref={trail} className="h-full w-full origin-top scale-y-0 bg-ember" />
      </div>

      {projects.map((p) => (
        <li key={p.id} className="relative">
          {/* Sits dead centre on the trajectory: 5rem padding minus 4.25rem. */}
          <span
            aria-hidden
            data-node
            className="survey-node absolute -left-[4.25rem] top-1.5 hidden h-2 w-2 border border-line lg:block"
          />

          {p.image_url && (
            <figure data-plate className="relative mb-10 overflow-hidden bg-ground">
              <div className="aspect-[16/9] lg:aspect-[21/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-shot
                  src={p.image_url}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover will-change-transform"
                />
              </div>
              <div data-veil aria-hidden className="absolute inset-0 bg-ground" />
            </figure>
          )}

          <div className="grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
            <div>
              <h2 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {p.title}
              </h2>
              {p.subtitle && <p className="mt-2 text-muted">{p.subtitle}</p>}
              {p.mentors && <p className="mt-5 text-sm text-ink/70">Mentored by {p.mentors}</p>}
              {p.year && <p className="mt-1 font-mono text-xs text-muted/60">{p.year}</p>}
            </div>

            <div>
              {p.body && <p className="max-w-[62ch] leading-relaxed text-ink/85">{p.body}</p>}
              {p.tags.length > 0 && (
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-muted/80">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
