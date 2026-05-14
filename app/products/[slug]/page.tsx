import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Share2, Bookmark } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { SchemaProduct } from "@/components/seo/SchemaProduct"
import { ImageGallery } from "@/components/product/ImageGallery"
import { WhereToBuy } from "@/components/product/WhereToBuy"
import { ProductGrid } from "@/components/product/ProductGrid"
import { ProductViewTracker } from "@/components/product/ProductViewTracker"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/ui/PriceDisplay"
import type { Database } from "@/types/supabase"

type Product = Database["public"]["Tables"]["products"]["Row"]
type AgentPlatform = Database["public"]["Tables"]["agent_platforms"]["Row"]

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"
const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "7.2")

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

// ── Static params for top products (ISR / partial prerender) ─────────
export async function generateStaticParams() {
  // Use admin client — generateStaticParams runs at build time without HTTP request
  const { data } = await supabaseAdmin
    .from("products")
    .select("slug")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("click_count", { ascending: false })
    .limit(50)

  return (data ?? []).map(({ slug }) => ({ slug }))
}

// ── SEO Metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("title, brand, price_cny, price_usd, images, seo_title, seo_description, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) return { title: "Product Not Found | Finds Engine" }

  const priceUsd = product.price_usd ?? product.price_cny / USD_RATE
  const displayTitle = product.seo_title ||
    `${product.brand ? product.brand + " " : ""}${product.title}`

  const title = `${displayTitle} – Buy from China ≈ $${priceUsd.toFixed(2)} | Finds Engine`
  const description =
    product.seo_description ||
    `Buy ${product.title} from China starting at $${priceUsd.toFixed(2)}. Compare prices on Kakobuy, CNFans, Fishgoo and more agent platforms.`

  const firstImage = product.images?.[0]
  const ogImage = firstImage
    ? firstImage.startsWith("http")
      ? firstImage
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${firstImage}`
    : undefined

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${slug}`,
      images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: product.title }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

// ── Page Component ────────────────────────────────────────────────────
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  // ── Fetch product + platforms + related in parallel ────────────────
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) notFound()

  const priceUsd = product.price_usd ?? product.price_cny / USD_RATE

  // Fetch platforms and related products in parallel
  const [{ data: platforms }, { data: relatedProducts }, { data: relatedBlogPosts }] =
    await Promise.all([
      supabaseAdmin
        .from("agent_platforms")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabaseAdmin
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", product.id)
        .or(
          `brand.eq.${product.brand ?? "__none__"},category.eq.${product.category}`
        )
        .limit(8),
      supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, published_at")
        .eq("status", "published")
        .contains("tags", product.tags ?? [])
        .limit(3),
    ])

  // Pass raw platforms — WhereToBuy handles currency conversion client-side
  const activePlatforms = platforms ?? []

  // Parse sizes from JSON field
  const sizes = product.sizes as Record<string, string[]> | null

  // Format platform fee description for comparison table
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Client tracker for page view + attribution */}
      <ProductViewTracker productId={product.id} />

      {/* Schema structured data */}
      <SchemaProduct product={product} platforms={platforms ?? []} />
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: "Products", url: `${SITE_URL}/products` },
          ...(product.category
            ? [
                {
                  name: product.category,
                  url: `${SITE_URL}/products?category=${encodeURIComponent(product.category)}`,
                },
              ]
            : []),
          { name: product.title, url: `${SITE_URL}/products/${slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(product.category
            ? [
                {
                  label: product.category,
                  href: `/products?category=${encodeURIComponent(product.category)}`,
                },
              ]
            : []),
          { label: product.title },
        ]}
      />

      {/* ── Two-column layout ─────────────────────────────────────── */}
      <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
        {/* Left: Image gallery */}
        <ImageGallery images={product.images ?? []} alt={product.title} />

        {/* Right: Product info */}
        <div className="space-y-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
              {product.brand}
            </p>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-zinc-900">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900">
              <PriceDisplay priceCny={product.price_cny ?? 0} />
            </span>
            <span className="text-base text-zinc-400">¥{product.price_cny}</span>
          </div>

          {/* Sizes */}
          {sizes && Object.keys(sizes).length > 0 && (
            <div className="space-y-2">
              {Object.entries(sizes).map(([system, sizeList]) => (
                <div key={system}>
                  <p className="mb-1 text-xs font-medium text-zinc-500">{system}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(sizeList) ? sizeList : []).map((s) => (
                      <span
                        key={s}
                        className="inline-flex h-8 min-w-[32px] cursor-default items-center justify-center rounded-md border border-zinc-200 px-2 text-sm text-zinc-700 transition-colors hover:border-zinc-400"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Colors</p>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Where to Buy */}
          <WhereToBuy
            product={{
              id: product.id,
              title: product.title,
              source_item_id: product.source_item_id,
              price_cny: product.price_cny,
            }}
            platforms={activePlatforms}
            promoter={null}
          />

          <Separator />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5">
              <Bookmark className="size-3.5" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5">
              <Share2 className="size-3.5" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* ── Full-width sections below ─────────────────────────────── */}
      <div className="mt-12 space-y-12">
        {/* Description */}
        {(product.description || product.description_zh) && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">About this product</h2>
            <div className="max-w-prose space-y-3 text-sm leading-relaxed text-zinc-600">
              {(product.description || "").split("\n").filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {product.description_zh && (
                <p className="text-zinc-400">{product.description_zh}</p>
              )}
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              You may also like
            </h2>
            <ProductGrid
              products={relatedProducts.map((p) => ({
                ...p,
                brand_name: p.brand ?? undefined,
              }))}
            />
          </section>
        )}

        {/* Related blog posts */}
        {relatedBlogPosts && relatedBlogPosts.length > 0 && (
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">Related Guides</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {relatedBlogPosts.map((post) => {
                const coverImg = post.cover_image
                  ? post.cover_image.startsWith("http")
                    ? post.cover_image
                    : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
                  : null

                return (
                  <a
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-xl border border-zinc-100 transition-all hover:border-zinc-200 hover:shadow-sm"
                  >
                    {coverImg && (
                      <div className="aspect-video overflow-hidden bg-zinc-50">
                        <img
                          src={coverImg}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-700">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
