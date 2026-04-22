"use client";

import { useEffect, useState } from "react";
import { ordersApi } from "@/lib/api/orders";
import type { Order, OrderStatus, Page } from "@/types";

const STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "FULFILLED", "CANCELLED"];

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING:    "bg-amber-100 text-amber-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED:    "bg-purple-100 text-purple-700",
  FULFILLED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-600",
};

// Valid next transitions per status
const NEXT_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["FULFILLED"],
  FULFILLED:  [],
  CANCELLED:  [],
};

export default function AdminOrdersPage() {
  const [data, setData] = useState<Page<Order> | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    ordersApi.listAll(statusFilter, page)
      .then(setData)
      .finally(() => setLoading(false));
  }, [statusFilter, page]);

  async function handleStatusUpdate(orderId: number, newStatus: OrderStatus) {
    setUpdating(orderId);
    try {
      const updated = await ordersApi.updateStatus(orderId, newStatus);
      setData((prev) =>
        prev ? { ...prev, content: prev.content.map((o) => o.id === updated.id ? updated : o) } : prev
      );
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] tracking-widest uppercase text-taupe mr-2">Filter:</span>
        <button
          onClick={() => { setStatusFilter(undefined); setPage(0); }}
          className={`px-3 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
            !statusFilter ? "bg-espresso text-cream border-espresso" : "border-sand text-brown hover:border-brown"
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-3 py-1.5 text-xs tracking-widest uppercase border transition-colors ${
              statusFilter === s ? "bg-espresso text-cream border-espresso" : "border-sand text-brown hover:border-brown"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-sand">
        {/* overflow-x-auto enables horizontal scroll on mobile */}
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-sand bg-cream/50">
              {["Order", "Customer", "Date", "Items", "Total", "Status", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] tracking-widest uppercase text-taupe font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-taupe">Loading orders…</td>
              </tr>
            ) : !data?.content.length ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-taupe">No orders found.</td>
              </tr>
            ) : (
              data.content.map((order) => (
                <>
                  <tr
                    key={order.id}
                    className="border-b border-sand/50 hover:bg-cream/30 transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td className="px-5 py-4 text-sm font-medium text-espresso whitespace-nowrap">#{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-espresso">{order.customerName}</p>
                      <p className="text-xs text-taupe">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-taupe whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-4 text-sm text-taupe">{order.items.length}</td>
                    <td className="px-5 py-4 font-serif text-base text-espresso whitespace-nowrap">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] tracking-widest uppercase px-2 py-1 font-medium whitespace-nowrap ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {NEXT_TRANSITIONS[order.status].length > 0 ? (
                        <div className="flex items-center gap-1">
                          {NEXT_TRANSITIONS[order.status].map((next) => (
                            <button
                              key={next}
                              onClick={() => handleStatusUpdate(order.id, next)}
                              disabled={updating === order.id}
                              className={`px-2.5 py-1 text-[10px] tracking-widest uppercase border transition-colors disabled:opacity-40 whitespace-nowrap ${
                                next === "CANCELLED"
                                  ? "border-red-200 text-red-500 hover:bg-red-50"
                                  : "border-sand text-brown hover:border-brown hover:bg-cream"
                              }`}
                            >
                              {updating === order.id ? "…" : next}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-taupe tracking-wide whitespace-nowrap">Terminal</span>
                      )}
                    </td>
                  </tr>

                  {/* Expanded order detail */}
                  {expandedOrder === order.id && (
                    <tr key={`${order.id}-detail`} className="bg-cream/40">
                      <td colSpan={7} className="px-8 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Items */}
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-taupe mb-3">Order Items</p>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <div>
                                    <span className="text-espresso">{item.productNameSnap}</span>
                                    <span className="text-taupe ml-2">({item.variantLabelSnap})</span>
                                    <span className="text-taupe ml-2">× {item.quantity}</span>
                                  </div>
                                  <span className="text-espresso font-medium">
                                    ₹{(item.unitPriceSnap * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipping */}
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-taupe mb-3">Shipping Address</p>
                            <address className="not-italic text-sm text-brown leading-relaxed">
                              {order.shippingAddress.street}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                              {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                            </address>
                            {order.customerPhone && (
                              <p className="text-xs text-taupe mt-2">📞 {order.customerPhone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
        </div>{/* end overflow-x-auto */}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-sand flex items-center justify-between">
            <p className="text-xs text-taupe">{data.totalElements} orders</p>
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
