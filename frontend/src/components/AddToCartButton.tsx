"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import type { ProductDetail, Variant } from "@/types";

interface Props {
  product: ProductDetail;
  variants: Variant[];
}

export default function AddToCartButton({ product, variants }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    variants.length === 1 ? variants[0].id : null
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantLabel: selectedVariant.label,
      price: selectedVariant.price,
      imageUrl: product.images[0] ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Variant selector — pill buttons */}
      {variants.length > 1 && (
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
            Select Size / Quantity
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const isSelected = selectedVariantId === v.id;
              const isOOS = v.stock === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => !isOOS && setSelectedVariantId(v.id)}
                  disabled={isOOS}
                  className={`px-4 py-2 text-sm border transition-all duration-150 ${
                    isSelected
                      ? "bg-espresso text-cream border-espresso"
                      : isOOS
                      ? "border-sand text-taupe line-through cursor-not-allowed"
                      : "border-sand text-espresso hover:border-espresso"
                  }`}
                >
                  {v.label}
                  {isOOS && <span className="ml-1 text-[10px]">(OOS)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price */}
      {selectedVariant && (
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl text-espresso">₹{selectedVariant.price}</span>
          {selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <span className="text-xs text-red-500 tracking-wide">
              Only {selectedVariant.stock} left
            </span>
          )}
        </div>
      )}

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant || selectedVariant.stock === 0}
        className={`w-full py-4 text-sm tracking-widest uppercase font-medium transition-all duration-300 ${
          added
            ? "bg-green-800 text-cream cursor-default"
            : !selectedVariant
            ? "bg-sand text-taupe cursor-not-allowed"
            : selectedVariant.stock === 0
            ? "bg-sand text-taupe cursor-not-allowed"
            : "bg-espresso text-cream hover:bg-brown"
        }`}
      >
        {added
          ? "✓ Added to Cart"
          : !selectedVariant
          ? "Select an Option"
          : selectedVariant.stock === 0
          ? "Out of Stock"
          : "Add to Cart"}
      </button>
    </div>
  );
}
