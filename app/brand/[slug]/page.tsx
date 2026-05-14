import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Pagination } from "@/components/product/Pagination"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"
const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "USD_RATE")
const PER_PAGE = 24

interface BrandPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

// ── Static params: prerender top brands ─────────────────────────────
export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from("brands")
    .select("slug")
    .eq("status", "active")
    .order("product_count", { ascending: false })
    .limit(50)
  return (data ?? []).map(({ slug }) => ({ slug }))
}

// ── SEO Metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: brand } = await supabaseAdmin
    .from("brands")
    .select("name, product_count")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!brand) return { title: "Brand Not Found | Finds Engine" }

  const title = `${brand.name} on Finds Engine – Buy from China`
  const description = `Find the best ${brand.name} products from China. Compare prices across trusted agent platforms. ${brand.product_count ? `${brand.product_count}+ ${brand.name} products available.` : ""}`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/brand/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/brand/${slug}`,
    },
  }
}

// ── Page Component ────────────────────────────────────────────────────
export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params
  const { page: pageParam, sort = "popular" } = await searchParams
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
  const offset = (page - 1) * PER_PAGE

  // ── Parallel queries ───────────────────────────────────────────────
  const [
    { data: brand },
    { data: products, count: totalCount },
    { data: relatedBlogPosts },
  ] = await Promise.all([
    // Brand info
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, logo_url, product_count")
      .eq("slug", slug)
      .eq("status", "active")
      .single(),

    // Products by brand (match brand name case-insensitively via ilike)
    supabaseAdmin
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .ilike("brand", slug.replace(/-/g, " "))
      .range(offset, offset + PER_PAGE - 1),

    // Related blog posts (generic for now)
    supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("status", "published")
      .limit(3),
  ])

  if (!brand) notFound()

  // Sort products client-side
  const sortedProducts = [...(products ?? [])].sort((a, b) => {
    switch (sort) {
      case "newest":
        return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime()
      case "price_asc":
        return (a.price_usd ?? a.price_cny / USD_RATE) - (b.price_usd ?? b.price_cny / USD_RATE)
      case "price_desc":
        return (b.price_usd ?? b.price_cny / USD_RATE) - (a.price_usd ?? a.price_cny / USD_RATE)
      case "popular":
      default:
        return (b.click_count ?? 0) - (a.click_count ?? 0)
    }
  })

  const totalPages = Math.ceil((totalCount ?? 0) / PER_PAGE)

  // Get distinct categories from these products
  const categorySet = new Set<string>()
  ;(products ?? []).forEach((p) => {
    if (p.category) categorySet.add(p.category)
  })
  const categories = Array.from(categorySet).slice(0, 6)

  const brandLogoUrl = brand.logo_url
    ? brand.logo_url.startsWith("http")
      ? brand.logo_url
      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${brand.logo_url}`
    : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* JSON-LD */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: brand.name, url: `${SITE_URL}/brand/${slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: brand.name },
        ]}
      />

      {/* Brand header */}
      <div className="mb-8 mt-4 flex items-start gap-5">
        {/* Brand logo */}
        {brandLogoUrl ? (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white p-2 shadow-sm">
            <Image
              src={brandLogoUrl}
              alt={`${brand.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-xl font-bold text-zinc-400">
            {brand.name.charAt(0)}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {brand.name} on Finds Engine
          </h1>
          <p className="mt-1.5 text-base text-zinc-500">
            Shop authentic {brand.name} products from China via trusted agent platforms.
            {brand.product_count != null && (
              <> {brand.product_count}+ products available.</>
            )}
          </p>
        </div>
      </div>

      {/* Categories in this brand */}
      {categories.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Shop by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sort controls */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {totalCount ?? 0} products
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Sort:</span>
          <div className="flex gap-1">
            {[
              { value: "popular", label: "Popular" },
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price ↑" },
              { value: "price_desc", label: "Price ↓" },
            ].map((option) => (
              <Link
                key={option.value}
                href={`/brand/${slug}?sort=${option.value}&page=1`}
                className={`rounded-md px-3 py-1 text-sm transition-colors ${
                  sort === option.value
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <ProductGrid
        products={sortedProducts.map((p) => ({
          ...p,
          brand_name: p.brand ?? undefined,
        }))}
        emptyMessage={`No ${brand.name} products found yet. Check back soon!`}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/brand/${slug}`}
            searchParams={{ sort }}
          />
        </div>
      )}

      {/* Related blog posts */}
      {relatedBlogPosts && relatedBlogPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            {brand.name} Guides & Buying Tips
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedBlogPosts.map((post) => {
              const coverImg = post.cover_image
                ? post.cover_image.startsWith("http")
                  ? post.cover_image
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
                : null

              return (
                <Link
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
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{post.excerpt}</p>
                    )}
                    {post.published_at && (
                      <p className="mt-2 text-xs text-zinc-300">
                        {new Date(post.published_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
