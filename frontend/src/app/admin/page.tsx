"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import { ordersApi } from "@/lib/api/orders";
import type { Page, ProductSummary, Order } from "@/types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ label, value, sub, icon, href }: StatCardProps) {
  const content = (
    <div className="bg-white border border-sand p-6 hover:border-brown transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-cream flex items-center justify-center text-brown group-hover:bg-sand transition-colors">
          {icon}
        </div>
        {href && (
          <svg className="w-4 h-4 text-taupe group-hover:text-brown transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
      <p className="font-serif text-3xl text-espresso mb-1">{value}</p>
      <p className="text-xs tracking-widest uppercase text-taupe">{label}</p>
      {sub && <p className="text-xs text-taupe mt-1">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Page<ProductSummary> | null>(null);
  const [orders, setOrders] = useState<Page<Order> | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Page<Order> | null>(null);
  const [recentOrders, setRecentOrders] = useState<Page<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      productsApi.list({ size: 1 }),
      ordersApi.listAll(undefined, 0, 1),          // total count
      ordersApi.listAll("PENDING", 0, 5),           // pending for dashboard table
      ordersApi.listAll(undefined, 0, 5),           // recent orders (all statuses)
    ]).then(([p, o, pending, recent]) => {
      setProducts(p);
      setOrders(o);
      setPendingOrders(pending);
      setRecentOrders(recent);
      setLastRefreshed(new Date());
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-taupe">
            Last updated: {lastRefreshed.toLocaleTimeString("en-IN")}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-sand text-xs tracking-widest uppercase text-brown hover:border-brown transition-colors disabled:opacity-40"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={loading ? "—" : products?.totalElements ?? 0}
          href="/admin/products"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatCard
          label="Total Orders"
          value={loading ? "—" : orders?.totalElements ?? 0}
          href="/admin/orders"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Pending Orders"
          value={loading ? "—" : pendingOrders?.totalElements ?? 0}
          sub="Awaiting processing"
          href="/admin/orders"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Store Status"
          value="Live"
          sub="All systems operational"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Recent orders table — all statuses, most recent first */}
      <div className="bg-white border border-sand">
        <div className="px-4 sm:px-6 py-4 border-b border-sand flex items-center justify-between">
          <h2 className="font-serif text-lg text-espresso">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs tracking-widest uppercase text-brown hover:text-espresso transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-taupe text-sm">Loading…</div>
        ) : !recentOrders?.content.length ? (
          <div className="p-8 text-center">
            <p className="text-sm text-taupe">No orders yet.</p>
          </div>
        ) : (
          /* overflow-x-auto enables horizontal scroll on mobile */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-sand">
                  {["Order ID", "Customer", "Date", "Items", "Total", "Status"].map((h) => (
                    <th key={h} className="px-4 sm:px-6 py-3 text-left text-[10px] tracking-widest uppercase text-taupe font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.content.map((order) => (
                  <tr key={order.id} className="border-b border-sand/50 hover:bg-cream/50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-espresso whitespace-nowrap">#{order.id}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-brown">{order.customerName}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-taupe whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-taupe">{order.items.length}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-espresso whitespace-nowrap">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`text-[10px] tracking-widest uppercase px-2 py-1 font-medium whitespace-nowrap ${
                        order.status === "PENDING"    ? "bg-amber-100 text-amber-700" :
                        order.status === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                        order.status === "SHIPPED"    ? "bg-purple-100 text-purple-700" :
                        order.status === "FULFILLED"  ? "bg-green-100 text-green-700" :
                                                        "bg-red-100 text-red-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/products"
          className="bg-white border border-sand p-6 flex items-center gap-4 hover:border-brown transition-colors group"
        >
          <div className="w-10 h-10 bg-espresso flex items-center justify-center text-cream flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-espresso group-hover:text-brown transition-colors">Manage Products</p>
            <p className="text-xs text-taupe mt-0.5">Update stock, images, and pricing</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white border border-sand p-6 flex items-center gap-4 hover:border-brown transition-colors group"
        >
          <div className="w-10 h-10 bg-espresso flex items-center justify-center text-cream flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-espresso group-hover:text-brown transition-colors">Manage Orders</p>
            <p className="text-xs text-taupe mt-0.5">Update order status and fulfillment</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
