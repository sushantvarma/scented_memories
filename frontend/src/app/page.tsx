import Link from "next/link";
import { productsApi } from "@/lib/api/products";
import type { Category, ProductSummary } from "@/types";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const [productsPage, categories] = await Promise.all([
    productsApi.list({ size: 8, sortBy: "createdAt", sortDir: "desc" }),
    productsApi.listCategories(),
  ]);

  const featured: ProductSummary[] = productsPage.content;
  const cats: Category[] = categories;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-espresso text-cream overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-32 md:py-48 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-6">
            Home Fragrance &amp; Wellness
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-light leading-tight mb-6">
            Scents that tell<br />
            <em>your story</em>
          </h1>
          <div className="w-16 h-px bg-gold mx-auto mb-8" />
          <p className="text-sand text-lg font-light max-w-md mx-auto mb-12 leading-relaxed">
            Curated fragrances for every mood, ritual, and space.
            Crafted with natural ingredients from across India.
          </p>
          <Link href="/products" className="btn-primary bg-gold text-espresso hover:bg-gold-light">
            Explore Collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Browse</p>
          <h2 className="section-title">Shop by Category</h2>
          <div className="divider" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cats.map((c) => (
            <Link
              key={c.id}
              href={`/products?categoryId=${c.id}`}
              className="group flex flex-col items-center p-6 bg-white border border-sand hover:border-brown transition-all duration-300 text-center"
            >
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center mb-3 group-hover:bg-gold-light transition-colors">
                <span className="text-brown text-lg">✦</span>
              </div>
              <span className="text-xs tracking-widest uppercase text-espresso font-medium group-hover:text-brown transition-colors">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-warm-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">New Arrivals</p>
            <h2 className="section-title">Featured Products</h2>
            <div className="divider" />
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
          <div className="text-center mt-12">
            <Link href="/products" className="btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Brand values strip */}
      <section className="border-t border-b border-sand py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { icon: "🌿", title: "Natural Ingredients", desc: "Sourced from across India" },
            { icon: "✦", title: "Artisan Crafted", desc: "Small-batch, hand-rolled" },
            { icon: "📦", title: "Free Shipping", desc: "On orders above ₹999" },
          ].map((v) => (
            <div key={v.title} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{v.icon}</span>
              <p className="font-serif text-lg text-espresso">{v.title}</p>
              <p className="text-sm text-taupe">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
