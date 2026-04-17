"use client";

/**
 * Order confirmation page — must be a CLIENT component.
 *
 * Reason: GET /api/orders/{id} requires a JWT for authenticated users.
 * The JWT lives in localStorage, which is only accessible in the browser.
 * A server component would call the API with no token → 401 from the backend.
 *
 * Guest orders (user_id = NULL) are ADMIN-only per the API spec, so guests
 * will always get a 403 here — that is correct behaviour.
 */

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { ordersApi } from "@/lib/api/orders";
import { ApiClientError } from "@/lib/apiClient";
import type { Order } from "@/types";

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Number(params.id);
    if (isNaN(id)) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    ordersApi
      .getById(id)
      .then(setOrder)
      .catch((err) => {
        if (err instanceof ApiClientError) {
          setError(err.apiError.message);
        } else {
          setError("Could not load order.");
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-taupe tracking-widest uppercase animate-pulse">
          Loading your order…
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="font-serif text-2xl text-espresso mb-3">Order not found</p>
        <p className="text-sm text-taupe mb-8">{error ?? "This order does not exist."}</p>
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Success header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Thank you</p>
        <h1 className="font-serif text-4xl text-espresso font-light mb-2">Order Confirmed</h1>
        <p className="text-sm text-taupe">
          Hi {order.customerName}, your order{" "}
          <span className="font-medium text-espresso">#{order.id}</span> has been placed.
        </p>
      </div>

      <div className="space-y-6">
        {/* Order items */}
        <div className="bg-white border border-sand p-6">
          <h2 className="font-serif text-lg text-espresso mb-5">Items Ordered</h2>
          <ul className="space-y-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-espresso font-medium">{item.productNameSnap}</span>
                  <span className="text-taupe ml-2">— {item.variantLabelSnap}</span>
                  <span className="text-taupe ml-2">× {item.quantity}</span>
                </div>
                <span className="text-espresso font-medium">
                  ₹{(item.unitPriceSnap * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-sand mt-5 pt-4 flex justify-between font-serif text-lg text-espresso">
            <span>Total</span>
            <span>₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping address */}
        <div className="bg-white border border-sand p-6">
          <h2 className="font-serif text-lg text-espresso mb-4">Shipping To</h2>
          <address className="not-italic text-sm text-brown leading-relaxed">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
            — {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </address>
        </div>

        {/* Status */}
        <div className="bg-white border border-sand p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-taupe mb-1">Order Status</p>
            <p className="font-serif text-lg text-espresso">{order.status}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-widest uppercase text-taupe mb-1">Order Date</p>
            <p className="text-sm text-brown">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

// Note: metadata exports are not supported in client components.
// The root layout's title template ("%s | ScentedMemories") applies.
// To set a specific title, add a layout.tsx alongside this page.
