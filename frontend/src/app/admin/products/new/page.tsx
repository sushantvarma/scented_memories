"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminProductsApi, productsApi } from "@/lib/api/products";
import { ApiClientError } from "@/lib/apiClient";
import type { Category, Tag, VariantRequest } from "@/types";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsMap, setTagsMap] = useState<Record<string, Tag[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([productsApi.listCategories(), productsApi.listTags()]).then(
      ([cats, tags]) => { setCategories(cats); setTagsMap(tags); }
    );
  }, []);

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
      await adminProductsApi.create(data);
      router.push("/admin/products");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.apiError.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProductForm
      title="Add New Product"
      categories={categories}
      tagsMap={tagsMap}
      saving={saving}
      error={error}
      onSave={handleSave}
      onCancel={() => router.push("/admin/products")}
    />
  );
}
