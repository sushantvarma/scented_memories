"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient.get<Page<ProductSummary>>("/api/products?size=1"),
      ordersApi.listAll(undefined, 0, 1),
      ordersApi.listAll("PENDING", 0, 5),
    ]).then(([p, o, pending]) => {
      setProducts(p);
      setOrders(o);
      setPendingOrders(pending);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
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

      {/* Pending orders table */}
      <div className="bg-white border border-sand">
        <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
          <h2 className="font-serif text-lg text-espresso">Pending Orders</h2>
          <Link href="/admin/orders" className="text-xs tracking-widest uppercase text-brown hover:text-espresso transition-colors">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-taupe text-sm">Loading…</div>
        ) : !pendingOrders?.content.length ? (
          <div className="p-8 text-center">
            <p className="text-sm text-taupe">No pending orders. You&apos;re all caught up!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand">
                {["Order ID", "Customer", "Date", "Items", "Total"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-[10px] tracking-widest uppercase text-taupe font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingOrders.content.map((order) => (
                <tr key={order.id} className="border-b border-sand/50 hover:bg-cream/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-espresso">#{order.id}</td>
                  <td className="px-6 py-4 text-sm text-brown">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm text-taupe">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-6 py-4 text-sm text-taupe">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                  <td className="px-6 py-4 text-sm font-medium text-espresso">₹{order.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
