"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminProductsApi, productsApi } from "@/lib/api/products";
import type { Page, ProductSummary } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-600",
};

export default function AdminProductsPage() {
  const [data, setData] = useState<Page<ProductSummary> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deactivating, setDeactivating] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  function fetchProducts(p: number, q?: string) {
    setLoading(true);
    // Use admin endpoint — searches by product name only, not description.
    // This prevents "lavender" matching Eucalyptus because its description mentions lavender.
    const params = new URLSearchParams({ page: String(p), size: "20" });
    if (q) params.set("search", q);
    adminProductsApi.list(p, q)
      .then(setData)
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchProducts(page, search); }, [page]);

  async function handleSoftDelete(id: number, name: string) {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    setDeactivating(id);
    try {
      await adminProductsApi.deactivate(id);
      setData((prev) =>
        prev ? { ...prev, content: prev.content.filter((p) => p.id !== id) } : prev
      );
    } finally {
      setDeactivating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <form
          onSubmit={(e) => { e.preventDefault(); setPage(0); fetchProducts(0, search); }}
          className="flex gap-0 flex-1 max-w-sm"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field text-sm py-2"
          />
          <button type="submit" className="px-4 py-2 bg-espresso text-cream text-xs tracking-widest uppercase hover:bg-brown transition-colors">
            Search
          </button>
        </form>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-espresso text-cream text-xs tracking-widest uppercase hover:bg-brown transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-sand">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-sand bg-cream/50">
              {["Product", "Category", "Starting Price", "Status", "Actions"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[10px] tracking-widest uppercase text-taupe font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-taupe">
                  Loading products…
                </td>
              </tr>
            ) : !data?.content.length ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-taupe">
                  No products found.
                </td>
              </tr>
            ) : (
              data.content.map((p) => (
                <tr key={p.id} className="border-b border-sand/50 hover:bg-cream/30 transition-colors">
                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sand flex-shrink-0 overflow-hidden">
                        {p.primaryImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.primaryImageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-taupe text-xs">✦</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-espresso">{p.name}</p>
                        <p className="text-xs text-taupe font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span className="text-xs tracking-wide text-brown">{p.category.name}</span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <span className="font-serif text-base text-espresso">
                      {p.startingPrice != null ? `₹${p.startingPrice}` : "—"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`text-[10px] tracking-widest uppercase px-2 py-1 font-medium ${STATUS_COLORS.active}`}>
                      Active
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs tracking-widest uppercase text-brown hover:text-espresso transition-colors"
                      >
                        Edit
                      </Link>
                      <span className="text-sand">|</span>
                      <a
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="text-xs tracking-widest uppercase text-taupe hover:text-espresso transition-colors"
                      >
                        View
                      </a>
                      <span className="text-sand">|</span>
                      <button
                        onClick={() => handleSoftDelete(p.id, p.name)}
                        disabled={deactivating === p.id}
                        className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                      >
                        {deactivating === p.id ? "…" : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>{/* end overflow-x-auto */}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-sand flex items-center justify-between">
            <p className="text-xs text-taupe">{data.totalElements} products</p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-sand text-xs text-espresso hover:border-espresso transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-xs text-taupe">Page {page + 1} of {data.totalPages}</span>
              <button
                disabled={page + 1 >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-sand text-xs text-espresso hover:border-espresso transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
