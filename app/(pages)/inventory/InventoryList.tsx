"use client";

import { useMemo, useState } from "react";
import { Empty } from "@/components/PageHeader";
import type { PublicItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function InventoryList({ items }: { items: PublicItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    return [...counts].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (i) =>
        (!category || i.category === category) &&
        (!q || [i.name, i.variant, i.category, i.description].some((f) => f?.toLowerCase().includes(q))),
    );
  }, [items, query, category]);

  const chip = (active: boolean) =>
    cn(
      "rounded border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
      active ? "border-ink text-ink" : "border-line text-muted hover:text-ink",
    );

  return (
    <div>
      <div className="mb-8 space-y-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search equipment"
          aria-label="Search equipment"
          className="input max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          <button className={chip(category === null)} onClick={() => setCategory(null)}>
            All [{items.length}]
          </button>
          {categories.map(([name, count]) => (
            <button key={name} className={chip(category === name)} onClick={() => setCategory(name)}>
              {name} [{count}]
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <Empty>No equipment matches that search.</Empty>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {visible.map((i) => (
            <li key={i.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_9rem_9rem] sm:items-baseline sm:gap-6">
              <div>
                <p className="font-medium">
                  {i.name} {i.variant && <span className="font-normal text-muted">{i.variant}</span>}
                </p>
                {i.description && <p className="mt-1 text-sm text-muted">{i.description}</p>}
              </div>
              <span className="label">{i.category}</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className={cn("h-1.5 w-1.5 rounded-full", i.available ? "bg-ember" : "bg-muted/40")}
                  />
                  <span className={i.available ? "text-ink" : "text-muted"}>
                    {i.available ? "Available" : "Out of stock"}
                  </span>
                </span>
                {i.bench_only && <span className="text-xs text-muted">Lab use only</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
