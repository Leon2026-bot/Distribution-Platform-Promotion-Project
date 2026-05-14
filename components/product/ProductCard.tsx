"use client"

import Image from "next/image"
import Link from "next/link"
import { Database } from "@/types/supabase"
import { useCurrency } from "@/components/providers/CurrencyProvider"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]

interface ProductCardProps {
  product: ProductRow & {
    brand_name?: string
    platform_count?: number
  }
  sort?: string
}

function getBadge(product: ProductRow, sort?: string) {
  if (sort === "popular") {
    if (product.is_featured) {
      return { label: "Best Seller", className: "bg-amber-500 text-white" }
    }
  } else if (sort === "newest") {
    const createdAt = product.created_at ? new Date(product.created_at) : null
    if (createdAt) {
      const daysDiff = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff <= 7) {
        return { label: "New", className: "bg-blue-500 text-white" }
      }
    }
  } else {
    // default / price_desc / you may also like
    if (product.is_featured) {
      return { label: "Featured", className: "bg-zinc-900 text-white" }
    }
  }
  return null
}

export function ProductCard({ product, sort }: ProductCardProps) {
  const rawImage = product.images?.[0] ?? null
  const imageUrl =
    !rawImage
      ? "/placeholder.webp"
      : rawImage.startsWith("http")
        ? rawImage
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${rawImage}`

  const priceCny = product.price_cny ?? 0
  const { convert, symbol, currency } = useCurrency()
  const displayPrice = convert(priceCny)
  const formattedPrice = currency === "CNY"
    ? `${symbol}${Math.round(displayPrice).toLocaleString()}`
    : `${symbol}${displayPrice.toFixed(2)}`

  const badge = getBadge(product, sort)

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all duration-200 hover:border-zinc-200 hover:shadow-md"
    >
      {/* Image - 1:1 ratio */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
        <Image
          src={imageUrl}
          alt={product.title ?? "Product image"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Badge */}
        {badge && (
          <div className="absolute top-2 left-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 pb-3 pt-2.5">
        {/* Brand */}
        {product.brand_name && (
          <p className="text-xs text-zinc-400">{product.brand_name}</p>
        )}

        {/* Title - 2 lines */}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-zinc-900">
          {product.title}
        </h3>

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-zinc-900">{formattedPrice}</span>
          {currency !== "CNY" && (
            <span className="text-xs text-zinc-400">¥{priceCny}</span>
          )}
        </div>

        {/* Platform count */}
        {product.platform_count ? (
          <p className="mt-1 text-xs text-zinc-400">
            {product.platform_count} platforms available
          </p>
        ) : null}
      </div>
    </Link>
  )
}
