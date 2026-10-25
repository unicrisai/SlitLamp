"use client";

import { useMemo, useState } from "react";

export type FilterItem = {
  key: string;
  subspecialtyIds: string[];
  types: string[];
  node: React.ReactNode;
};

type Option = { id: string; label: string };

// Client-side filter over server-rendered cards.
export function FilterableList({
  items,
  subspecialties,
  types,
}: {
  items: FilterItem[];
  subspecialties: Option[];
  types: Option[];
}) {
  const [sub, setSub] = useState("");
  const [type, setType] = useState("");

  const visible = useMemo(
    () => items.filter((i) => (!sub || i.subspecialtyIds.includes(sub)) && (!type || i.types.includes(type))),
    [items, sub, type],
  );

  const select = "rounded-lg border border-line bg-surface px-3 py-2 text-sm";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Subspecialty
          <select className={select} value={sub} onChange={(e) => setSub(e.target.value)}>
            <option value="">All</option>
            {subspecialties.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          Evidence type
          <select className={select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All</option>
            {types.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm text-muted" aria-live="polite">
          {visible.length} of {items.length}
        </span>
      </div>
      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
          No papers match these filters.
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((i) => (
            <div key={i.key}>{i.node}</div>
          ))}
        </div>
      )}
    </div>
  );
}
