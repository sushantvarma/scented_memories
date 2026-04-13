"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-espresso mb-3">Your cart is empty</h1>
        <p className="text-sm text-taupe mb-8">Discover our collection of premium fragrances.</p>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Review</p>
        <h1 className="font-serif text-4xl text-espresso font-light">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-sand text-[10px] tracking-widest uppercase text-taupe">
            <span className="col-span-6">Product</span>
            <span className="col-span-2 text-center">Price</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-2 text-right">Total</span>
          </div>

          {items.map((item) => (
            <div key={item.variantId} className="grid grid-cols-12 gap-4 py-6 border-b border-sand items-center">
              {/* Product info */}
              <div className="col-span-12 md:col-span-6 flex items-center gap-4">
                <div className="w-16 h-16 bg-sand flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-taupe text-lg">✦</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-serif text-base text-espresso">{item.productName}</p>
                  <p className="text-xs text-taupe mt-0.5">{item.variantLabel}</p>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-[10px] tracking-widest uppercase text-taupe hover:text-red-500 transition-colors mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-4 md:col-span-2 text-center text-sm text-espresso">
                ₹{item.price}
              </div>

              {/* Quantity */}
              <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                  className="w-7 h-7 border border-sand text-espresso hover:border-espresso transition-colors text-sm flex items-center justify-center"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm text-espresso">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                  className="w-7 h-7 border border-sand text-espresso hover:border-espresso transition-colors text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className="col-span-4 md:col-span-2 text-right text-sm font-medium text-espresso">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="mt-4 text-xs tracking-widest uppercase text-taupe hover:text-red-500 transition-colors"
          >
            Clear cart
          </button>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-sand p-6 sticky top-24">
            <h2 className="font-serif text-xl text-espresso mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-brown">
                <span>Subtotal</span>
                <span>₹{subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-taupe">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-sand pt-4 mb-6">
              <div className="flex justify-between font-medium text-espresso">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-lg">₹{subtotal().toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-taupe mt-1">Final total confirmed at checkout</p>
            </div>

            <button
              onClick={() => router.push("/checkout")}
              className="btn-primary w-full"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/products"
              className="block text-center text-xs tracking-widest uppercase text-taupe hover:text-espresso transition-colors mt-4"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
