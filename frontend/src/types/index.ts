// =============================================================================
// ScentedMemories — shared TypeScript types
// Mirror the Spring Boot DTOs exactly so the API layer is type-safe end-to-end.
// =============================================================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export type TagDimension = "SCENT" | "MOOD" | "USE_CASE";

export interface Tag {
  id: number;
  name: string;
  dimension: TagDimension;
}

export interface Variant {
  id: number;
  label: string;
  price: number;
  stock: number;
  active: boolean;
}

/** Returned in paginated product listing */
export interface ProductSummary {
  id: number;
  slug: string;
  name: string;
  primaryImageUrl: string | null;
  startingPrice: number | null;
  category: Category;
  tags: Tag[];
}

/** Returned for product detail page */
export interface ProductDetail {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  images: string[];
  category: Category;
  tags: Tag[];
  variants: Variant[];
  active: boolean;
}

/** Spring Data Page wrapper */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface ProductFilters {
  categoryId?: number;
  tagIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

// ── Order types ───────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "FULFILLED"
  | "CANCELLED";

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItemRequest {
  variantId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  items: OrderItemRequest[];
}

export interface OrderItemResponse {
  id: number;
  variantId: number;
  productNameSnap: string;
  variantLabelSnap: string;
  unitPriceSnap: number;
  quantity: number;
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: ShippingAddress;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemResponse[];
  createdAt: string;
}

// ── Auth types ────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  token: string;
}

// ── API error shape ───────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}
