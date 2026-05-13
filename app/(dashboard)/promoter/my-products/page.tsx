"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface MyProduct {
  id: string
  product_id: string | null
  custom_name: string | null
  custom_price: number | null
  custom_image: string | null
  is_pinned: boolean | null
  status: string | null
  product: {
    title: string
    brand: string | null
    price_cny: number
    images: string[]
    slug: string
  } | null
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<MyProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/promoter/my-products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? [])
        setLoading(false)
      })
      .catch(() => {
        toast.error("Failed to load products")
        setLoading(false)
      })
  }, [])

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/promoter/my-products/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("Removed from your picks")
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error("Failed to remove")
      }
    } catch {
      toast.error("Network error")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">My Products</h1>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">My Products</h1>

      {products.length === 0 ? (
        <div className="rounded-xl border border-zinc-100 bg-white p-12 text-center">
          <p className="text-sm text-zinc-400">No products in your picks yet.</p>
          <a
            href="/promoter/products"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 underline"
          >
            Browse products →
          </a>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-100 bg-white">
          {products.map((item) => {
            const product = item.product
            const title = item.custom_name || product?.title || "Unknown"
            const price = item.custom_price || product?.price_cny || 0
            const image =
              item.custom_image ||
              product?.images?.[0] ||
              "/placeholder.webp"
            const imageUrl = image.startsWith("http")
              ? image
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${image}`

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 px-4 py-3"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-50">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">
                    {title}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {product?.brand} · ≈ ${(price / 7.2).toFixed(2)}
                  </p>
                </div>

                {item.is_pinned && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    Pinned
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {product?.slug && (
                    <a
                      href={`/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
