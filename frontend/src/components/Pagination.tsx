"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export default function Pagination({ currentPage, totalPages, totalElements }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-sand">
      <p className="text-xs text-taupe tracking-wide">{totalElements} products</p>

      <div className="flex items-center gap-1">
        <button
          disabled={currentPage === 0}
          onClick={() => goToPage(currentPage - 1)}
          className="w-9 h-9 border border-sand text-espresso text-sm hover:border-espresso transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          ←
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`w-9 h-9 text-xs transition-colors ${
              i === currentPage
                ? "bg-espresso text-cream"
                : "border border-sand text-espresso hover:border-espresso"
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage + 1 >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="w-9 h-9 border border-sand text-espresso text-sm hover:border-espresso transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        >
          →
        </button>
      </div>
    </div>
  );
}
