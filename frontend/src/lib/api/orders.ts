import { apiClient } from "@/lib/apiClient";
import type { CreateOrderRequest, Order, OrderStatus, Page } from "@/types";

export const ordersApi = {
  create: (request: CreateOrderRequest) =>
    apiClient.post<Order>("/api/orders", request),

  getById: (id: number) =>
    apiClient.get<Order>(`/api/orders/${id}`),

  // Admin
  listAll: (status?: OrderStatus, page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (status) params.set("status", status);
    return apiClient.get<Page<Order>>(`/api/admin/orders?${params}`);
  },

  updateStatus: (id: number, status: OrderStatus) =>
    apiClient.put<Order>(`/api/admin/orders/${id}/status`, { status }),
};
