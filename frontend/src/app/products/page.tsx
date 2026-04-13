import { productsApi } from "@/lib/api/products";
import type { ProductFilters } from "@/types";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";

interface SearchParams {
  categoryId?: string;
  tagIds?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  page?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters: ProductFilters = {
    categoryId: searchParams.categoryId ? Number(searchParams.categoryId) : undefined,
    tagIds: searchParams.tagIds
      ? (Array.isArray(searchParams.tagIds) ? searchParams.tagIds : [searchParams.tagIds]).map(Number)
      : undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    search: searchParams.search,
    page: searchParams.page ? Number(searchParams.page) : 0,
    size: 20,
  };

  const [productsPage, categories, tagsMap] = await Promise.all([
    productsApi.list(filters),
    productsApi.listCategories(),
    productsApi.listTags(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Page header */}
      <div className="mb-10 pb-8 border-b border-sand">
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Collection</p>
        <h1 className="font-serif text-4xl text-espresso font-light">All Products</h1>
        <p className="text-sm text-taupe mt-1">{productsPage.totalElements} products</p>
      </div>

      <div className="flex gap-10">
        {/* Sidebar */}
        <FilterSidebar categories={categories} tagsMap={tagsMap} currentFilters={filters} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <form method="GET" className="mb-8 flex gap-0">
            <input
              name="search"
              defaultValue={searchParams.search ?? ""}
              placeholder="Search by name or description…"
              className="input-field flex-1"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-espresso text-cream text-xs tracking-widest uppercase hover:bg-brown transition-colors"
            >
              Search
            </button>
          </form>

          {/* Results */}
          {productsPage.content.length === 0 ? (
            <div className="text-center py-24 border border-sand">
              <p className="font-serif text-2xl text-espresso mb-2">No products found</p>
              <p className="text-sm text-taupe">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 list-none p-0">
              {productsPage.content.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          )}

          <Pagination
            currentPage={filters.page ?? 0}
            totalPages={productsPage.totalPages}
            totalElements={productsPage.totalElements}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Shop All Products" };
}
