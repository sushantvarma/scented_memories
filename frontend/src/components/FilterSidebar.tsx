"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Category, ProductFilters, Tag } from "@/types";

interface Props {
  categories: Category[];
  tagsMap: Record<string, Tag[]>;
  currentFilters: ProductFilters;
}

const DIMENSION_LABELS: Record<string, string> = {
  SCENT: "Scent",
  MOOD: "Mood",
  USE_CASE: "Use Case",
};

export default function FilterSidebar({ categories, tagsMap, currentFilters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  function applyFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    value === null ? params.delete(key) : params.set(key, value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function toggleTag(tagId: number) {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.getAll("tagIds").map(Number);
    params.delete("tagIds");
    if (existing.includes(tagId)) {
      existing.filter((id) => id !== tagId).forEach((id) => params.append("tagIds", String(id)));
    } else {
      [...existing, tagId].forEach((id) => params.append("tagIds", String(id)));
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  const activeTagIds = currentFilters.tagIds ?? [];
  const hasFilters = currentFilters.categoryId || activeTagIds.length > 0 || currentFilters.minPrice || currentFilters.maxPrice;
  const activeFilterCount = (currentFilters.categoryId ? 1 : 0) + activeTagIds.length + (currentFilters.minPrice || currentFilters.maxPrice ? 1 : 0);

  const filterContent = (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs tracking-[0.2em] uppercase font-medium text-espresso">Filters</h2>
        {hasFilters && (
          <button
            onClick={() => router.push("/products")}
            className="text-[10px] tracking-widest uppercase text-taupe hover:text-brown transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <div className="mb-8">
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3 font-medium">Category</h3>
        <ul className="space-y-1 list-none p-0">
          {categories.map((c) => {
            const active = currentFilters.categoryId === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => applyFilter("categoryId", active ? null : String(c.id))}
                  className={`w-full text-left text-sm py-1.5 px-2 transition-colors duration-150 ${
                    active
                      ? "text-espresso font-medium bg-sand"
                      : "text-brown hover:text-espresso hover:bg-cream"
                  }`}
                  aria-pressed={active}
                >
                  {c.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Tags by dimension */}
      {Object.entries(tagsMap).map(([dimension, tags]) => (
        <div key={dimension} className="mb-8">
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3 font-medium">
            {DIMENSION_LABELS[dimension] ?? dimension}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const active = activeTagIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTag(t.id)}
                  className={`text-[10px] tracking-wider uppercase px-2.5 py-1 border transition-all duration-150 ${
                    active
                      ? "bg-espresso text-cream border-espresso"
                      : "bg-transparent text-brown border-sand hover:border-brown"
                  }`}
                  aria-pressed={active}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price range */}
      <div className="mb-8">
        <h3 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3 font-medium">Price (₹)</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const min = fd.get("minPrice") as string;
            const max = fd.get("maxPrice") as string;
            const params = new URLSearchParams(searchParams.toString());
            min ? params.set("minPrice", min) : params.delete("minPrice");
            max ? params.set("maxPrice", max) : params.delete("maxPrice");
            params.delete("page");
            router.push(`/products?${params.toString()}`);
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              name="minPrice" type="number" placeholder="Min"
              defaultValue={currentFilters.minPrice}
              className="input-field text-xs py-2"
            />
            <input
              name="maxPrice" type="number" placeholder="Max"
              defaultValue={currentFilters.maxPrice}
              className="input-field text-xs py-2"
            />
          </div>
          <button type="submit" className="w-full py-2 text-[10px] tracking-widest uppercase border border-espresso text-espresso hover:bg-espresso hover:text-cream transition-colors">
            Apply
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: filter toggle button ─────────────────────────────────── */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2.5 border border-sand text-xs tracking-widest uppercase text-espresso hover:border-espresso transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 4h18M7 8h10M11 12h4" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 bg-espresso text-cream text-[10px] flex items-center justify-center rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Mobile filter panel */}
        {mobileOpen && (
          <div className="mt-4 p-5 border border-sand bg-white">
            {filterContent}
            <button
              onClick={() => setMobileOpen(false)}
              className="w-full py-2.5 bg-espresso text-cream text-xs tracking-widest uppercase mt-2"
            >
              Show Results
            </button>
          </div>
        )}
      </div>

      {/* ── Desktop: always-visible sidebar ──────────────────────────────── */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        {filterContent}
      </aside>
    </>
  );
}
