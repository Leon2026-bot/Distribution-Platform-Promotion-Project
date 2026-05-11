"use client"

import { Database } from "@/types/supabase"
import { BuyNowButton } from "./BuyNowButton"

type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

interface PromoterWithChannels {
  id: string
  username: string
  default_platform_id?: string | null
  channels?: Record<string, { member_id: string }>
}

interface WhereToBuyProps {
  product: {
    id: string
    title: string
    source_item_id: string | null
    price_cny?: number | null
  }
  platforms: (AgentPlatform & { estimated_price_usd?: number })[]
  promoter?: PromoterWithChannels | null
}

export function WhereToBuy({ product, platforms, promoter }: WhereToBuyProps) {
  // Sort platforms by estimated price low to high
  const sortedPlatforms = [...platforms]
    .filter((p) => p.is_active)
    .sort(
      (a, b) =>
        (a.estimated_price_usd ?? Infinity) -
        (b.estimated_price_usd ?? Infinity)
    )

  if (sortedPlatforms.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900">
          Where to Buy
        </h3>
        <p className="text-sm text-zinc-400">No platforms available.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-zinc-100 bg-white">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-zinc-900">Where to Buy</h3>
      </div>

      <div className="divide-y divide-zinc-50">
        {sortedPlatforms.map((platform) => {
          // Determine member_id: promoter's channel if configured, else site_promo_code
          const memberId =
            promoter?.channels?.[platform.id]?.member_id ||
            platform.site_promo_code ||
            ""

          return (
            <div
              key={platform.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Platform Logo/Name */}
              <div className="flex shrink-0 items-center gap-2">
                {platform.logo_url ? (
                  <img
                    src={
                      platform.logo_url.startsWith("http")
                        ? platform.logo_url
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/platforms/${platform.logo_url}`
                    }
                    alt={platform.name}
                    className="size-6 object-contain"
                  />
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-500">
                    {platform.name.charAt(0)}
                  </div>
                )}
                <span className="text-sm font-medium text-zinc-700">
                  {platform.name}
                </span>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Estimated Price */}
              {platform.estimated_price_usd && (
                <span className="text-sm font-semibold text-zinc-900">
                  ≈ ${platform.estimated_price_usd.toFixed(2)}
                </span>
              )}

              {/* Buy Button */}
              <BuyNowButton
                platform={platform}
                product={product}
                memberId={memberId}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
