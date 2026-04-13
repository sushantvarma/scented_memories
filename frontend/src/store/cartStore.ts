/**
 * ScentedMemories cart store — Zustand (in-memory, no persistence for MVP)
 *
 * Interface is fixed per steering doc. Key behaviours:
 * - addItem: increments quantity if variantId already exists
 * - updateQuantity(id, 0): removes the item
 * - subtotal: derived — sum(price × quantity)
 * - price stored at add-time for display only; server recomputes from DB at checkout
 */

import { create } from "zustand";

export interface CartItem {
  variantId: number;
  productId: number;
  productName: string;
  variantLabel: string;
  price: number;       // display only — server ignores this at order creation
  quantity: number;
  imageUrl: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (variantId) =>
    set((state) => ({
      items: state.items.filter((i) => i.variantId !== variantId),
    })),

  updateQuantity: (variantId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.variantId !== variantId) };
      }
      return {
        items: state.items.map((i) =>
          i.variantId === variantId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () => set({ items: [] }),

  subtotal: () =>
    get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

  itemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
