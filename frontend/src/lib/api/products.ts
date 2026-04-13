import { apiClient } from "@/lib/apiClient";
import type {
  Category,
  Page,
  ProductDetail,
  ProductFilters,
  ProductSummary,
  Tag,
} from "@/types";

function buildProductQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
  if (filters.tagIds?.length) {
    filters.tagIds.forEach((id) => params.append("tagIds", String(id)));
  }
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  if (filters.search) params.set("search", filters.search);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortDir) params.set("sortDir", filters.sortDir);

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const productsApi = {
  list: (filters: ProductFilters = {}) =>
    apiClient.get<Page<ProductSummary>>(`/api/products${buildProductQuery(filters)}`),

  getBySlug: (slug: string) =>
    apiClient.get<ProductDetail>(`/api/products/${slug}`),

  listCategories: () =>
    apiClient.get<Category[]>("/api/categories"),

  listTags: () =>
    apiClient.get<Record<string, Tag[]>>("/api/tags"),
};
