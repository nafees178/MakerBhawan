"use client";

import { useEffect, useRef } from "react";

export const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// One rAF per frame at most, however many scroll events arrive.
export function onScrollFrame(update: () => void) {
  let raf = 0;
  const schedule = () => {
    if (!raf) {
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    }
  };
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    cancelAnimationFrame(raf);
  };
}

export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onScrollFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px]">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-ember shadow-[0_0_12px_rgba(247,148,29,0.7)]" />
    </div>
  );
}

export function Parallax({
  rate,
  className,
  children,
}: {
  rate: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    return onScrollFrame(() => {
      // Only the first screen moves; past that the hero is off-screen anyway.
      const y = Math.min(window.scrollY, window.innerHeight * 1.2) * rate;
      if (ref.current) ref.current.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  }, [rate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

// Paragraphs brighten as they reach reading height. Dimmed by CSS only once
// script has run (see .intro-p in globals.css), so nothing depends on JS.
export function IntroText({ paragraphs }: { paragraphs: string[] }) {
  const refs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    const els = refs.current.filter((el): el is HTMLParagraphElement => el !== null);
    if (reducedMotion()) {
      els.forEach((el) => (el.style.opacity = "1"));
      return;
    }
    return onScrollFrame(() => {
      const h = window.innerHeight;
      for (const el of els) {
        const top = el.getBoundingClientRect().top;
        const t = 1 - Math.min(1, Math.max(0, (top - h * 0.6) / (h * 0.3)));
        el.style.opacity = String(0.2 + 0.8 * t);
      }
    });
  }, []);

  return (
    <div className="space-y-10">
      {paragraphs.map((p, n) => (
        <p
          key={n}
          ref={(el) => {
            refs.current[n] = el;
          }}
          className="intro-p text-2xl font-medium leading-snug tracking-tight sm:text-4xl sm:leading-[1.2]"
        >
          {p}
        </p>
      ))}
    </div>
  );
}
