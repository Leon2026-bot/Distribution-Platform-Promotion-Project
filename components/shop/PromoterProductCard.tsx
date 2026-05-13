"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ExternalLink } from "lucide-react"
import type { Database } from "@/types/supabase"

type ProductRow = Database["public"]["Tables"]["products"]["Row"]
type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

interface PromoterProductCardProps {
  product: ProductRow
  defaultPlatform?: AgentPlatform | null
  memberId?: string
  promoterId?: string
}

function buildJumpUrl(
  platform: AgentPlatform,
  product: { source_item_id: string | null },
  memberId: string
): string {
  const template = platform.jump_url_template
  if (!template) return "#"
  return template
    .replace("{item_id}", product.source_item_id || "")
    .replace("{member_id}", memberId || "")
}

export function PromoterProductCard({
  product,
  defaultPlatform,
  memberId = "",
  promoterId,
}: PromoterProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const rawImage = product.images?.[0] ?? null
  const imageUrl = !rawImage
    ? "/placeholder.webp"
    : rawImage.startsWith("http")
      ? rawImage
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${rawImage}`

  const priceCny = product.price_cny ?? 0
  const priceUsd = (priceCny / 7.2).toFixed(2)

  const handleBuyNow = async () => {
    if (!defaultPlatform || !product.source_item_id) return
    setIsLoading(true)

    // Track click
    try {
      const { getSessionId, getClientInfo } = await import("@/lib/tracking")
      const sessionId = getSessionId()
      const clientInfo = getClientInfo()
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "buy_click",
          session_id: sessionId,
          product_id: product.id,
          platform_id: defaultPlatform.id,
          promoter_id: promoterId || null,
          referrer: clientInfo.referrer,
          user_agent: clientInfo.user_agent,
        }),
      })
    } catch {
      // silent fail
    }

    const url = buildJumpUrl(defaultPlatform, product, memberId)
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
    setIsLoading(false)
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all duration-200 hover:border-zinc-200 hover:shadow-md">
      {/* Image - clickable to product detail */}
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
          <Image
            src={imageUrl}
            alt={product.title ?? "Product image"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="px-3 pb-3 pt-2.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-zinc-400">{product.brand}</p>
        )}

        {/* Title - clickable */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-zinc-900 transition-colors hover:text-zinc-600">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-zinc-900">
            ≈ ${priceUsd}
          </span>
          <span className="text-xs text-zinc-400">¥{priceCny}</span>
        </div>

        {/* Buy Now Button */}
        {defaultPlatform && (
          <button
            onClick={handleBuyNow}
            disabled={isLoading || !product.source_item_id}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy on {defaultPlatform.name}
            <ExternalLink className="size-3" />
          </button>
        )}
      </div>
    </div>
  )
}
