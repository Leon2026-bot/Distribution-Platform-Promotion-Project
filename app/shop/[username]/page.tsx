import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { PromoterProductCard } from "@/components/shop/PromoterProductCard"
import { PromoterShopTracker } from "@/components/shop/PromoterShopTracker"
import type { Database } from "@/types/supabase"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"

type PromoterRow = Database["public"]["Tables"]["promoters"]["Row"]
type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]
type PromoterProductRow = Database["public"]["Tables"]["promoter_products"]["Row"]
type ProductRow = Database["public"]["Tables"]["products"]["Row"]

interface ShopPageProps {
  params: { username: string }
}

/* ------------------------------------------------------------------ */
/*  SEO Metadata                                                        */
/* ------------------------------------------------------------------ */
export async function generateMetadata({
  params,
}: ShopPageProps): Promise<Metadata> {
  const { username } = params

  const { data: promoter } = await supabaseAdmin
    .from("promoters")
    .select("display_name, bio")
    .eq("username", username)
    .eq("status", "active")
    .single()

  if (!promoter) {
    return { title: "Promoter Not Found | Finds Engine" }
  }

  const displayName = promoter.display_name || username
  const title = `${displayName}'s Picks – Buy from China | Finds Engine`
  const description = `Check out ${displayName}'s curated finds from Taobao & 1688. Hand-picked products at great prices via top agents.`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/shop/${username}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/shop/${username}`,
    },
  }
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */
export default async function ShopPage({ params }: ShopPageProps) {
  const { username } = params

  /* ---- 1. Fetch promoter ------------------------------------------ */
  const { data: promoter } = await supabaseAdmin
    .from("promoters")
    .select("*")
    .eq("username", username)
    .eq("status", "active")
    .single()

  if (!promoter) notFound()

  /* ---- 2. Fetch promoter's active products ------------------------ */
  const { data: promoterProductsRaw } = await supabaseAdmin
    .from("promoter_products")
    .select("*, product:product_id(*)")
    .eq("promoter_id", promoter.id)
    .eq("status", "active")
    .order("is_pinned", { ascending: false })
    .order("display_order", { ascending: true })

  /* ---- 3. Fetch promoter channels --------------------------------- */
  const { data: channels } = await supabaseAdmin
    .from("promoter_channels")
    .select("*")
    .eq("promoter_id", promoter.id)
    .eq("is_active", true)

  /* ---- 4. Fetch all active platforms ------------------------------ */
  const { data: allPlatforms } = await supabaseAdmin
    .from("agent_platforms")
    .select("*")
    .eq("is_active", true)

  /* ---- Build lookup maps ------------------------------------------ */
  const channelMap = new Map<string, string>()
  channels?.forEach((ch) => {
    if (ch.platform_id) {
      channelMap.set(ch.platform_id, ch.member_id)
    }
  })

  const platformMap = new Map<string, AgentPlatform>()
  allPlatforms?.forEach((p) => {
    platformMap.set(p.id, p)
  })

  /* ---- Filter valid existing products ----------------------------- */
  const validProducts: { promoterProduct: PromoterProductRow; product: ProductRow }[] = []

  promoterProductsRaw?.forEach((pp) => {
    const prod = pp.product as unknown as ProductRow | null
    if (prod && pp.product_id) {
      validProducts.push({
        promoterProduct: pp as unknown as PromoterProductRow,
        product: prod,
      })
    }
  })

  /* ---- Default platform & member_id ------------------------------- */
  const defaultPlatformId = promoter.default_platform_id
  const defaultPlatform = defaultPlatformId
    ? platformMap.get(defaultPlatformId) || null
    : null

  const defaultMemberId = defaultPlatformId
    ? channelMap.get(defaultPlatformId) || defaultPlatform?.site_promo_code || ""
    : ""

  /* ---- Derived display values ------------------------------------- */
  const displayName = promoter.display_name || username

  const avatarUrl = promoter.avatar_url
    ? promoter.avatar_url.startsWith("http")
      ? promoter.avatar_url
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${promoter.avatar_url}`
    : null

  const socialLinks =
    (promoter.social_links as Record<string, string> | null) || {}

  const themeConfig =
    (promoter.theme_config as Record<string, unknown> | null) || {}
  const bannerConfig =
    (promoter.banner_config as Record<string, unknown> | null) || {}

  const bannerColor = (themeConfig.banner_color as string) || "#f4f4f5"
  const bannerText =
    (bannerConfig.text as string) ||
    `${displayName}'s curated picks`
  const bannerSubtitle =
    (bannerConfig.subtitle as string) ||
    "Hand-picked products from top Chinese shopping platforms"

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PromoterShopTracker promoterId={promoter.id} />

      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          {
            name: `${displayName}'s Picks`,
            url: `${SITE_URL}/shop/${username}`,
          },
        ]}
      />

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: `${displayName}'s Picks` },
        ]}
      />

      {/* Promoter Header */}
      <div className="mt-4 flex items-start gap-4">
        {avatarUrl ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-100">
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-bold text-zinc-400">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-xl font-bold text-zinc-900">{displayName}</h1>
          <p className="text-sm text-zinc-400">@{username}</p>
          {promoter.bio && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
              {promoter.bio}
            </p>
          )}
          {Object.keys(socialLinks).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 underline-offset-2 transition-colors hover:text-zinc-600 hover:underline"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner */}
      <div
        className="mt-6 rounded-xl px-6 py-8 text-center"
        style={{ backgroundColor: bannerColor }}
      >
        <h2 className="text-lg font-bold text-zinc-900">{bannerText}</h2>
        <p className="mt-1 text-sm text-zinc-600">{bannerSubtitle}</p>
      </div>

      {/* My Picks */}
      <section className="mt-10">
        <h2 className="mb-6 text-xl font-bold text-zinc-900">My Picks</h2>

        {validProducts.length === 0 ? (
          <div className="rounded-xl border border-zinc-100 bg-white p-8 text-center">
            <p className="text-sm text-zinc-400">No products curated yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {validProducts.map(({ product }) => (
              <PromoterProductCard
                key={product.id}
                product={product}
                defaultPlatform={defaultPlatform}
                memberId={defaultMemberId}
                promoterId={promoter.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Default Platform */}
      {defaultPlatform && (
        <div className="mt-10 flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4">
          <span className="text-sm text-zinc-500">Default Agent:</span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900">
            {defaultPlatform.logo_url ? (
              <img
                src={
                  defaultPlatform.logo_url.startsWith("http")
                    ? defaultPlatform.logo_url
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/partners/${defaultPlatform.logo_url}`
                }
                alt={defaultPlatform.name}
                className="h-5 w-auto object-contain"
              />
            ) : null}
            {defaultPlatform.name}
          </span>
        </div>
      )}
    </div>
  )
}
