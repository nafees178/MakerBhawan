"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqGroup {
  id: string;
  label: string;
  items: { q: string; a: string }[];
}

export function Faq({ groups, contactEmail }: { groups: FaqGroup[]; contactEmail: string }) {
  const [active, setActive] = useState(groups[0].id);

  return (
    <div className="grid gap-10 lg:grid-cols-[18rem_1fr]">
      <div className="space-y-6">
        <div role="tablist" aria-label="Question topics" className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          {groups.map((g) => (
            <button
              key={g.id}
              role="tab"
              aria-selected={g.id === active}
              onClick={() => setActive(g.id)}
              className={cn(
                "min-h-[44px] rounded-full border px-5 text-left text-sm transition-colors duration-200 lg:rounded-xl",
                g.id === active ? "border-ink bg-ink text-ground" : "border-line text-muted hover:text-ink",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-panel/60 p-6">
          <p className="font-medium">Still have a question?</p>
          <p className="mt-2 text-sm text-muted">Write to the lab and a coordinator will get back to you.</p>
          <a href={`mailto:${contactEmail}`} className="link mt-4 inline-block text-sm">
            {contactEmail} →
          </a>
        </div>
      </div>

      {groups
        .filter((g) => g.id === active)
        .map((g) => (
          <div key={g.id} role="tabpanel" className="divide-y divide-line border-y border-line">
            {g.items.map((item, n) => (
              <details key={item.q} className="group" open={n === 0}>
                <summary className="flex min-h-[64px] list-none items-center justify-between gap-6 py-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        ))}
    </div>
  );
}
