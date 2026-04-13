import Link from "next/link";
import { ordersApi } from "@/lib/api/orders";
import { ApiClientError } from "@/lib/apiClient";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function OrderConfirmationPage({ params }: Props) {
  let order;
  try {
    order = await ordersApi.getById(Number(params.id));
  } catch (err) {
    if (err instanceof ApiClientError && err.apiError.status === 404) notFound();
    throw err;
  }

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Thank you, {order.customerName}. Your order has been placed.</p>
      <p>Order ID: <strong>#{order.id}</strong></p>
      <p>Status: {order.status}</p>

      <h2>Items Ordered</h2>
      <ul>
        {order.items.map((item) => (
          <li key={item.id}>
            {item.productNameSnap} — {item.variantLabelSnap} × {item.quantity}
            <span> ₹{(item.unitPriceSnap * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <p><strong>Total: ₹{order.totalAmount.toFixed(2)}</strong></p>

      <h2>Shipping To</h2>
      <address>
        {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
        {order.shippingAddress.state} — {order.shippingAddress.postalCode},{" "}
        {order.shippingAddress.country}
      </address>

      <Link href="/products">Continue Shopping</Link>
    </div>
  );
}

export async function generateMetadata() {
  return { title: "Order Confirmed" };
}
