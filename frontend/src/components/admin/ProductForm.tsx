"use client";

import { useState } from "react";
import type { Category, Tag, VariantRequest } from "@/types";

interface FormData {
  name: string;
  description: string;
  categoryId: number;
  tagIds: number[];
  imageUrls: string[];
  variants: VariantRequest[];
}

interface Props {
  title: string;
  categories: Category[];
  tagsMap: Record<string, Tag[]>;
  saving: boolean;
  error: string | null;
  initialData?: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
}

const DIMENSION_LABELS: Record<string, string> = {
  SCENT: "Scent",
  MOOD: "Mood",
  USE_CASE: "Use Case",
};

const EMPTY_VARIANT: VariantRequest = { label: "", price: 0, stock: 0 };

export default function ProductForm({
  title,
  categories,
  tagsMap,
  saving,
  error,
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [categoryId, setCategoryId] = useState<number>(initialData?.categoryId ?? 0);
  const [tagIds, setTagIds] = useState<number[]>(initialData?.tagIds ?? []);
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.imageUrls?.length ? initialData.imageUrls : [""]
  );
  const [variants, setVariants] = useState<VariantRequest[]>(
    initialData?.variants?.length ? initialData.variants : [{ ...EMPTY_VARIANT }]
  );
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (!categoryId) errs.categoryId = "Category is required";
    if (variants.length === 0) errs.variants = "At least one variant is required";
    variants.forEach((v, i) => {
      if (!v.label.trim()) errs[`variant_${i}_label`] = "Label required";
      if (v.price < 0) errs[`variant_${i}_price`] = "Price must be ≥ 0";
      if (v.stock < 0) errs[`variant_${i}_stock`] = "Stock must be ≥ 0";
    });
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      categoryId,
      tagIds,
      imageUrls: imageUrls.filter((u) => u.trim()),
      variants,
    });
  }

  // ── Tag toggle ──────────────────────────────────────────────────────────────
  function toggleTag(id: number) {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  // ── Variant helpers ─────────────────────────────────────────────────────────
  function updateVariant(index: number, field: keyof VariantRequest, value: string | number) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { ...EMPTY_VARIANT }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Image URL helpers ───────────────────────────────────────────────────────
  function updateImageUrl(index: number, value: string) {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addImageUrl() {
    setImageUrls((prev) => [...prev, ""]);
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-espresso">{title}</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-sand text-xs tracking-widest uppercase text-brown hover:border-brown transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-espresso text-cream text-xs tracking-widest uppercase hover:bg-brown transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save & Publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic info */}
      <div className="bg-white border border-sand p-6 space-y-5">
        <h2 className="text-xs tracking-[0.2em] uppercase text-taupe font-medium">Product Details</h2>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-taupe mb-1.5">
            Product Name <span className="text-gold">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`input-field ${validationErrors.name ? "input-error" : ""}`}
            placeholder="e.g. Lavender Essential Oil"
          />
          {validationErrors.name && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-taupe mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input-field resize-none"
            placeholder="Describe the product, its benefits, and usage…"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-widest uppercase text-taupe mb-1.5">
            Category <span className="text-gold">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className={`input-field ${validationErrors.categoryId ? "input-error" : ""}`}
          >
            <option value={0}>Select a category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {validationErrors.categoryId && (
            <p className="text-xs text-red-500 mt-1">{validationErrors.categoryId}</p>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="bg-white border border-sand p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs tracking-[0.2em] uppercase text-taupe font-medium">Images</h2>
          <button
            type="button"
            onClick={addImageUrl}
            className="text-[10px] tracking-widest uppercase text-brown hover:text-espresso transition-colors"
          >
            + Add Image
          </button>
        </div>
        <p className="text-xs text-taupe">
          Enter image URLs. Use <code className="bg-sand px-1">/filename.jpeg</code> for images
          in the public folder, or a full URL for external images.
        </p>

        {imageUrls.map((url, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <input
                value={url}
                onChange={(e) => updateImageUrl(i, e.target.value)}
                className="input-field text-sm"
                placeholder={i === 0 ? "/lavender-essential-oil.jpeg" : "https://..."}
              />
              {/* Preview */}
              {url.trim() && (
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="preview"
                    className="w-12 h-12 object-cover border border-sand bg-sand"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-[10px] text-taupe">Preview</span>
                </div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <button
                type="button"
                onClick={() => removeImageUrl(i)}
                className="mt-3 text-taupe hover:text-red-500 transition-colors"
                aria-label="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Variants */}
      <div className="bg-white border border-sand p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs tracking-[0.2em] uppercase text-taupe font-medium">
            Variants & Pricing <span className="text-gold">*</span>
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="text-[10px] tracking-widest uppercase text-brown hover:text-espresso transition-colors"
          >
            + Add Variant
          </button>
        </div>
        {validationErrors.variants && (
          <p className="text-xs text-red-500">{validationErrors.variants}</p>
        )}

        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-12 gap-3 text-[10px] tracking-widest uppercase text-taupe">
            <span className="col-span-5">Label (e.g. 10ml, Pack of 12)</span>
            <span className="col-span-3">Price (₹)</span>
            <span className="col-span-3">Stock</span>
            <span className="col-span-1" />
          </div>

          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-5">
                <input
                  value={v.label}
                  onChange={(e) => updateVariant(i, "label", e.target.value)}
                  className={`input-field text-sm ${validationErrors[`variant_${i}_label`] ? "input-error" : ""}`}
                  placeholder="10ml"
                />
                {validationErrors[`variant_${i}_label`] && (
                  <p className="text-xs text-red-500 mt-0.5">{validationErrors[`variant_${i}_label`]}</p>
                )}
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => updateVariant(i, "price", parseFloat(e.target.value) || 0)}
                  className={`input-field text-sm ${validationErrors[`variant_${i}_price`] ? "input-error" : ""}`}
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  value={v.stock}
                  onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                  className={`input-field text-sm ${validationErrors[`variant_${i}_stock`] ? "input-error" : ""}`}
                />
              </div>
              <div className="col-span-1 flex justify-center pt-3">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    className="text-taupe hover:text-red-500 transition-colors"
                    aria-label="Remove variant"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white border border-sand p-6 space-y-5">
        <h2 className="text-xs tracking-[0.2em] uppercase text-taupe font-medium">Tags</h2>
        {Object.entries(tagsMap).map(([dimension, tags]) => (
          <div key={dimension}>
            <p className="text-[10px] tracking-widest uppercase text-taupe mb-2">
              {DIMENSION_LABELS[dimension] ?? dimension}
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`text-[10px] tracking-wider uppercase px-3 py-1.5 border transition-all ${
                      active
                        ? "bg-espresso text-cream border-espresso"
                        : "bg-transparent text-brown border-sand hover:border-brown"
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom save button */}
      <div className="flex justify-end gap-3 pb-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-sand text-xs tracking-widest uppercase text-brown hover:border-brown transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-espresso text-cream text-xs tracking-widest uppercase hover:bg-brown transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save & Publish"}
        </button>
      </div>
    </form>
  );
}
