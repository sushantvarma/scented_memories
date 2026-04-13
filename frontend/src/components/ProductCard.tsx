import Link from "next/link";
import type { ProductSummary } from "@/types";

interface Props {
  product: ProductSummary;
}

export default function ProductCard({ product }: Props) {
  return (
    <li className="list-none group">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden bg-sand aspect-square mb-4">
          {product.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl text-taupe">✦</span>
            </div>
          )}
          {/* Category badge */}
          <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-cream/90 text-espresso px-2 py-1">
            {product.category.name}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg text-espresso leading-snug group-hover:text-brown transition-colors">
            {product.name}
          </h3>

          {/* Tags — show first 3 */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((t) => (
              <span key={t.id} className="text-[10px] tracking-wider uppercase text-taupe">
                {t.name}
              </span>
            ))}
          </div>

          {product.startingPrice != null && (
            <p className="text-sm font-medium text-espresso">
              From <span className="font-serif text-base">₹{product.startingPrice}</span>
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}
