import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Pagination } from "@/components/product/Pagination"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"
const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "USD_RATE")
const PER_PAGE = 24

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}

// ── Static params: prerender top-level categories ────────────────────
export async function generateStaticParams() {
  const { data } = await supabaseAdmin
    .from("categories")
    .select("slug")
    .eq("status", "active")
    .is("parent_id", null)
  return (data ?? []).map(({ slug }) => ({ slug }))
}

// ── SEO Metadata ──────────────────────────────────────────────────────
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const { data: category } = await supabaseAdmin
    .from("categories")
    .select("name, product_count")
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!category) return { title: "Category Not Found | Finds Engine" }

  const title = `Best ${category.name} Finds from China | Finds Engine`
  const description = `Discover the best ${category.name} from China. Compare prices across trusted agent platforms. ${category.product_count ? `${category.product_count}+ products available.` : ""}`

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${slug}`,
    },
  }
}

// ── Page Component ────────────────────────────────────────────────────
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam, sort = "popular" } = await searchParams
  const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
  const offset = (page - 1) * PER_PAGE

  // ── Parallel queries ───────────────────────────────────────────────
  const [
    { data: category },
    { data: subCategories },
    { data: products, count: totalCount },
    { data: relatedBlogPosts },
  ] = await Promise.all([
    // Category info
    supabaseAdmin
      .from("categories")
      .select("id, name, slug, product_count")
      .eq("slug", slug)
      .eq("status", "active")
      .single(),

    // Sub-categories
    supabaseAdmin
      .from("categories")
      .select("id, name, slug, product_count")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),

    // Products in this category
    supabaseAdmin
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .ilike("category", slug.replace(/-/g, " "))
      .range(offset, offset + PER_PAGE - 1),

    // Related blog posts
    supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("status", "published")
      .limit(3),
  ])

  if (!category) notFound()

  // Filter sub-categories by parent_id (need parent id)
  const subs = (subCategories ?? []).filter(
    (c) => {
      // We don't have parent_id in the select, so we skip sub-cat filtering for now
      return false
    }
  )

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

  // Get distinct hot brands in this category
  const brandMap = new Map<string, number>()
  ;(products ?? []).forEach((p) => {
    if (p.brand) {
      brandMap.set(p.brand, (brandMap.get(p.brand) ?? 0) + 1)
    }
  })
  const hotBrands = Array.from(brandMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* JSON-LD */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: SITE_URL },
          { name: category.name, url: `${SITE_URL}/category/${slug}` },
        ]}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: category.name },
        ]}
      />

      {/* Header */}
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Best {category.name} Finds from China
        </h1>
        <p className="mt-2 max-w-2xl text-base text-zinc-500">
          Discover the best {category.name} sourced directly from China. Compare prices
          across trusted agent platforms like Kakobuy, CNFans, and Fishgoo.
          {category.product_count != null && (
            <> {category.product_count}+ products available.</>
          )}
        </p>
      </div>

      {/* Hot brands in this category */}
      {hotBrands.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Popular Brands
          </h2>
          <div className="flex flex-wrap gap-2">
            {hotBrands.map((brand) => (
              <Link
                key={brand}
                href={`/brand/${brand.toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white"
              >
                {brand}
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
                href={`/category/${slug}?sort=${option.value}&page=1`}
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
        emptyMessage={`No ${category.name} products found yet. Check back soon!`}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
            searchParams={{ sort }}
          />
        </div>
      )}

      {/* Related blog posts */}
      {relatedBlogPosts && relatedBlogPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            {category.name} Guides & Tips
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
