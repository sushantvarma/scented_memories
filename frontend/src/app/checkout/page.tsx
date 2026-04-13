"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { ordersApi } from "@/lib/api/orders";
import { ApiClientError } from "@/lib/apiClient";
import type { CreateOrderRequest } from "@/types";

const FIELDS = [
  { name: "customerName",  label: "Full Name",        type: "text",  required: true,  half: false },
  { name: "customerEmail", label: "Email Address",     type: "email", required: true,  half: true  },
  { name: "customerPhone", label: "Phone (optional)",  type: "tel",   required: false, half: true  },
  { name: "street",        label: "Street Address",    type: "text",  required: true,  half: false },
  { name: "city",          label: "City",              type: "text",  required: true,  half: true  },
  { name: "state",         label: "State",             type: "text",  required: true,  half: true  },
  { name: "postalCode",    label: "Postal Code",       type: "text",  required: true,  half: true  },
  { name: "country",       label: "Country",           type: "text",  required: true,  half: true  },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal } = useCartStore();

  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "",
    street: "", city: "", state: "", postalCode: "", country: "India",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) router.replace("/products");
  }, [items, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.customerName.trim()) next.customerName = "Name is required";
    if (!form.customerEmail.trim()) next.customerEmail = "Email is required";
    if (!form.street.trim()) next.street = "Street is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.state.trim()) next.state = "State is required";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    const request: CreateOrderRequest = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone || undefined,
      shippingAddress: {
        street: form.street, city: form.city, state: form.state,
        postalCode: form.postalCode, country: form.country,
      },
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    };

    try {
      const order = await ordersApi.create(request);
      clearCart();
      router.push(`/order-confirmation/${order.id}`);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.apiError.errors) setErrors(err.apiError.errors);
        else setServerError(err.apiError.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">Almost there</p>
        <h1 className="font-serif text-4xl text-espresso font-light">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-sand p-8">
            <h2 className="font-serif text-xl text-espresso mb-6">Shipping Details</h2>

            <div className="grid grid-cols-2 gap-4">
              {FIELDS.map(({ name, label, type, required, half }) => (
                <div key={name} className={half ? "col-span-1" : "col-span-2"}>
                  <label htmlFor={name} className="block text-[10px] tracking-widest uppercase text-taupe mb-1.5">
                    {label}{required && <span className="text-gold ml-0.5">*</span>}
                  </label>
                  <input
                    id={name} name={name} type={type}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    className={`input-field ${errors[name] ? "input-error" : ""}`}
                  />
                  {errors[name] && (
                    <p role="alert" className="text-xs text-red-500 mt-1">{errors[name]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p role="alert" className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full py-4">
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
        </form>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-sand p-6 sticky top-24">
            <h2 className="font-serif text-xl text-espresso mb-6">Order Summary</h2>

            <ul className="space-y-4 mb-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sand flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-taupe text-sm">✦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-espresso truncate">{item.productName}</p>
                    <p className="text-xs text-taupe">{item.variantLabel} × {item.quantity}</p>
                  </div>
                  <span className="text-sm text-espresso flex-shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-sand pt-4 space-y-2">
              <div className="flex justify-between text-sm text-brown">
                <span>Subtotal</span>
                <span>₹{subtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-espresso pt-2 border-t border-sand">
                <span className="font-serif text-lg">Total</span>
                <span className="font-serif text-lg">₹{subtotal().toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-taupe">Final total confirmed by server at order creation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
