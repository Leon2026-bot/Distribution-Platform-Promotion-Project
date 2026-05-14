"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { Search, Plus, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import type { Database } from "@/types/supabase"
import { useCurrency } from "@/components/providers/CurrencyProvider"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

interface ProductWithStatus extends ProductRow {
  is_added: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set())
  const { convert, symbol, currency } = useCurrency()

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/promoter/products")
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAdd = async (productId: string) => {
    setAddingIds((prev) => new Set(prev).add(productId))

    try {
      const res = await fetch("/api/promoter/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: [productId] }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(`Added ${data.added} product(s)`)
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, is_added: true } : p
          )
        )
      } else {
        toast.error(data.error || "Failed to add")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const filtered = products.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Product Center</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-sm text-zinc-400">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((product) => {
            const rawImage = product.images?.[0] ?? null
            const imageUrl = !rawImage
              ? "/placeholder.webp"
              : rawImage.startsWith("http")
                ? rawImage
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${rawImage}`

            const isAdding = addingIds.has(product.id)

            return (
              <div
                key={product.id}
                className="group relative overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
                  <Image
                    src={imageUrl}
                    alt={product.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />

                  {/* Add button overlay */}
                  {product.is_added ? (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        <Check className="size-3" />
                        Added
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAdd(product.id)}
                      disabled={isAdding}
                      className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                    >
                      <Plus className="size-3" />
                      {isAdding ? "Adding..." : "Add"}
                    </button>
                  )}
                </div>

                <div className="p-3">
                  <p className="text-xs text-zinc-400">{product.brand}</p>
                  <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-zinc-900">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {symbol}{(currency === "CNY" ? Math.round(convert(product.price_cny ?? 0)) : convert(product.price_cny ?? 0).toFixed(2)).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
