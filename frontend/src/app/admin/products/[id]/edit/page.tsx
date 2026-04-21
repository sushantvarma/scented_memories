"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminProductsApi, productsApi } from "@/lib/api/products";
import { ApiClientError } from "@/lib/apiClient";
import type { Category, ProductDetail, Tag, VariantRequest } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsMap, setTagsMap] = useState<Record<string, Tag[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminProductsApi.getById(productId),
      productsApi.listCategories(),
      productsApi.listTags(),
    ]).then(([prod, cats, tags]) => {
      setProduct(prod);
      setCategories(cats);
      setTagsMap(tags);
    }).catch((err) => {
      setError(err instanceof ApiClientError ? err.apiError.message : "Failed to load product.");
    }).finally(() => setLoading(false));
  }, [productId]);

  async function handleSave(data: {
    name: string;
    description: string;
    categoryId: number;
    tagIds: number[];
    imageUrls: string[];
    variants: VariantRequest[];
  }) {
    setSaving(true);
    setError(null);
    try {
      await adminProductsApi.update(productId, data);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.apiError.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-taupe animate-pulse">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-red-500">{error ?? "Product not found."}</p>
      </div>
    );
  }

  return (
    <ProductForm
      title={`Edit: ${product.name}`}
      categories={categories}
      tagsMap={tagsMap}
      saving={saving}
      error={error}
      initialData={{
        name: product.name,
        description: product.description ?? "",
        categoryId: product.category.id,
        tagIds: product.tags.map((t) => t.id),
        imageUrls: product.images,
        variants: product.variants.map((v) => ({
          label: v.label,
          price: v.price,
          stock: v.stock,
        })),
      }}
      onSave={handleSave}
      onCancel={() => router.push("/admin/products")}
    />
  );
}
