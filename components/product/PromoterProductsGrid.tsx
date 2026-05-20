"use client"

import { useState } from "react"
import { ProductCard } from "@/components/product/ProductCard"

interface Product {
  id: string
  title: string
  slug: string
  category?: string | null
  [key: string]: any
}

interface PromoterProductsGridProps {
  products: Product[]
  username: string
}

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
]

export function PromoterProductsGrid({ products, username }: PromoterProductsGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("default")
  const [visibleCount, setVisibleCount] = useState(8)

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[]

  // Filter & sort
  let filtered = selectedCategory === "all"
    ? products
    : products.filter((p) => p.category === selectedCategory)

  if (sortBy === "popular") {
    filtered = [...filtered].sort((a, b) => (b.click_count ?? 0) - (a.click_count ?? 0))
  } else if (sortBy === "newest") {
    filtered = [...filtered].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0
      const db = b.created_at ? new Date(b.created_at).getTime() : 0
      return db - da
    })
  }

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div>
      {/* Filter Bar */}
      {categories.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Sort & Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-zinc-400">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              refParam={`ref=${username}`}
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-zinc-400">
          No products in this category.
        </p>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + 8)}
            className="rounded-lg border border-zinc-200 bg-white px-6 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
