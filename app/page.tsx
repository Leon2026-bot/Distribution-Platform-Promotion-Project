import Link from "next/link"
import { ArrowRight, Search, Shield, Truck, Repeat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product/ProductCard"
import { HeroSearch } from "@/components/search/HeroSearch"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Reusable category icons for static nav
const categories = [
  { label: "Sneakers", slug: "sneakers", icon: "👟" },
  { label: "Clothing", slug: "clothing", icon: "👕" },
  { label: "Bags", slug: "bags", icon: "👜" },
  { label: "Accessories", slug: "accessories", icon: "⌚" },
  { label: "Electronics", slug: "electronics", icon: "📱" },
]

/** Format a count number into a human-readable string with "+" suffix.
 *  e.g. 15000 → "15,000+", 380 → "380+"
 */
function formatCount(n: number): string {
  return n.toLocaleString("en-US") + "+"
}

export default async function Home() {
  // Parallel data fetching
  const [
    { data: brands },
    { data: newProducts },
    { data: popularProducts },
    { data: platforms },
    { data: blogPosts },
    productCountResult,
    brandCountResult,
  ] = await Promise.all([
    // Hot Brands: 12 active, ordered by product_count desc
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, logo_url, product_count")
      .eq("status", "active")
      .order("product_count", { ascending: false })
      .limit(12),

    // New Arrivals: 8 most recent (with platform info)
    supabaseAdmin
      .from("products")
      .select("*, agent_platforms:platform_id(id, name, slug, logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8),

    // Most Popular: 8 by click_count
    supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("click_count", { ascending: false, nullsFirst: false })
      .limit(8),

    // Active Platforms
    supabaseAdmin
      .from("agent_platforms")
      .select("id, name, slug, logo_url, website_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    // Latest Blog Posts: 3 published
    supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, cover_image, excerpt, published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(3),

    // Total active products count
    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

    // Total active brands count
    supabaseAdmin
      .from("brands")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ])

  const activeProducts = (newProducts || []).map((p: any) => ({
    ...p,
    platform_name: p.agent_platforms?.name ?? null,
    platform_logo_url: p.agent_platforms?.logo_url ?? null,
  }))
  const totalProducts = productCountResult?.count ?? 0
  const totalBrands = brandCountResult?.count ?? 0

  return (
    <>
      {/* JSON-LD Breadcrumb for Home */}
      <SchemaBreadcrumb items={[{ name: "Home", url: "/" }]} />

      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-zinc-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
              Find &amp; Buy Anything{" "}
              <span className="text-zinc-400">from China</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600 sm:text-lg">
              Discover 150,000+ products from 380+ brands. Compare prices across
              trusted agents.
            </p>

            {/* Search Bar */}
            <form id="hero-search-form" action="/products" className="w-full">
              <HeroSearch
                placeholder="Search sneakers, bags, electronics..."
                action="/products"
                hotKeywords={["Sneakers", "Bags", "Jordan", "Nike"]}
              />
            </form>

            {/* Trust Bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-400 sm:text-sm">
              <span>{formatCount(totalProducts)} Products</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>{formatCount(totalBrands)} Brands</span>
              <span className="hidden sm:inline">&middot;</span>
              <span>{platforms?.length || 5} Platforms</span>
            </div>
          </div>
        </section>

        {/* Category Navigation */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Shop by Category
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-zinc-700">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Hot Brands */}
        {brands && brands.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                Popular Brands
              </h2>
              <Link href="/brands">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {brands.slice(0, 8).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
                >
                  {brand.logo_url ? (
                    <img
                      src={
                        brand.logo_url.startsWith("http")
                          ? brand.logo_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${brand.logo_url}`
                      }
                      alt={brand.name}
                      className="size-8 object-contain"
                    />
                  ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {brand.name}
                    </p>
                    {brand.product_count ? (
                      <span className="mt-0.5 inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        {brand.product_count.toLocaleString()} products
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Trending Products */}
        {activeProducts.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900">
                New Arrivals
              </h2>
              <Link href="/products?sort=newest">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 size-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Platform Partners */}
        {platforms && platforms.length > 0 && (
          <section className="border-t border-zinc-100 bg-zinc-50/50">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Trusted Agents
                </h2>
                <Link href="/partners">
                  <Button variant="ghost" size="sm">
                    Compare All
                    <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    href={platform.website_url || `#${platform.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-all hover:border-zinc-200 hover:shadow-sm"
                  >
                    {platform.logo_url ? (
                      <img
                        src={
                          platform.logo_url.startsWith("http")
                            ? platform.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${platform.logo_url}`
                        }
                        alt={platform.name}
                        className="h-6 object-contain"
                      />
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500">
                        {platform.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-zinc-700">
                      {platform.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How It Works */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900 sm:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Search,
                title: "Search",
                desc: "Browse 150K+ products from China's top marketplaces",
              },
              {
                icon: Repeat,
                title: "Compare",
                desc: "Compare prices and fees across 5 trusted agents",
              },
              {
                icon: Shield,
                title: "Buy Safe",
                desc: "Choose your agent and buy with quality guarantees",
              },
              {
                icon: Truck,
                title: "Receive",
                desc: "Get your items delivered right to your door",
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-100">
                  <step.icon className="size-5 text-zinc-600" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Blog Posts */}
        {blogPosts && blogPosts.length > 0 && (
          <section className="border-t border-zinc-100">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Latest Articles
                </h2>
                <Link href="/blog">
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="ml-1 size-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-sm"
                  >
                    {post.cover_image && (
                      <div className="aspect-video w-full overflow-hidden bg-zinc-50">
                        <img
                          src={
                            post.cover_image.startsWith("http")
                              ? post.cover_image
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog/${post.cover_image}`
                          }
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-zinc-600">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">
                          {post.excerpt}
                        </p>
                      )}
                      {post.published_at && (
                        <p className="mt-2 text-xs text-zinc-400">
                          {new Date(post.published_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-zinc-900 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to start shopping?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
              Browse our full catalog and find the best deals across all agents.
            </p>
            <div className="mt-6 flex items-center justify-center">
              <Link href="/products">
                <Button size="lg">
                  Browse Products
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
