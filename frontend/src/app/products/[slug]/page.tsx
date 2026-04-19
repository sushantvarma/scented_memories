import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import { ApiClientError } from "@/lib/apiClient";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

export default async function ProductDetailPage({ params }: Props) {
  let product;
  try {
    product = await productsApi.getBySlug(params.slug);
  } catch (err) {
    if (err instanceof ApiClientError && err.apiError.status === 404) notFound();
    throw err;
  }

  const activeVariants = product.variants.filter((v) => v.active);

  const scentTags = product.tags.filter((t) => t.dimension === "SCENT");
  const moodTags = product.tags.filter((t) => t.dimension === "MOOD");
  const useCaseTags = product.tags.filter((t) => t.dimension === "USE_CASE");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs tracking-widest uppercase text-taupe mb-10">
        <Link href="/" className="hover:text-espresso transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-espresso transition-colors">Shop</Link>
        <span>/</span>
        <Link
          href={`/products?categoryId=${product.category.id}`}
          className="hover:text-espresso transition-colors"
        >
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-espresso">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-3">
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square bg-sand overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((url, i) => (
                    <div key={i} className="aspect-square bg-sand overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`${product.name} ${i + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-sand flex items-center justify-center">
              <span className="text-6xl text-taupe">✦</span>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          {/* Category */}
          <Link
            href={`/products?categoryId=${product.category.id}`}
            className="text-xs tracking-[0.2em] uppercase text-gold hover:text-brown transition-colors mb-3"
          >
            {product.category.name}
          </Link>

          <h1 className="font-serif text-4xl text-espresso font-light leading-tight mb-4">
            {product.name}
          </h1>

          <div className="w-10 h-px bg-gold mb-6" />

          {/* Description */}
          {product.description && (
            <p className="text-sm text-brown leading-relaxed mb-8">{product.description}</p>
          )}

          {/* Tags */}
          <div className="space-y-3 mb-8">
            {scentTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] tracking-widest uppercase text-taupe w-16">Scent</span>
                {scentTags.map((t) => (
                  <span key={t.id} className="tag-pill">{t.name}</span>
                ))}
              </div>
            )}
            {moodTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] tracking-widest uppercase text-taupe w-16">Mood</span>
                {moodTags.map((t) => (
                  <span key={t.id} className="tag-pill">{t.name}</span>
                ))}
              </div>
            )}
            {useCaseTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] tracking-widest uppercase text-taupe w-16">Use</span>
                {useCaseTags.map((t) => (
                  <span key={t.id} className="tag-pill">{t.name}</span>
                ))}
              </div>
            )}
          </div>

          {/* Variant selector + Add to cart */}
          <div className="border-t border-sand pt-8">
            <AddToCartButton product={product} variants={activeVariants} />
          </div>

          {/* Trust signals */}
          <div className="mt-8 pt-6 border-t border-sand grid grid-cols-2 gap-4">
            {[
              { icon: "🌿", text: "Natural ingredients" },
              { icon: "✦", text: "Artisan crafted" },
              { icon: "📦", text: "Secure packaging" },
              { icon: "↩", text: "Easy returns" },
            ].map((s) => (
              <div key={s.text} className="flex items-center gap-2">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs text-taupe tracking-wide">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await productsApi.getBySlug(params.slug);
    return {
      title: product.name,
      description: product.description ?? undefined,
      openGraph: {
        title: product.name,
        description: product.description ?? undefined,
        images: product.images[0] ? [{ url: product.images[0] }] : [],
      },
    };
  } catch {
    return { title: "Product Not Found" };
  }
}
