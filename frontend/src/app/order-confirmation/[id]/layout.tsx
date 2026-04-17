import type { Metadata } from "next";

// Server layout alongside the client page — the only way to export metadata
// when the page itself is a client component.
export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default function OrderConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
