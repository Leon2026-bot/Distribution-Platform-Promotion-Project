import Link from "next/link"
import { ArrowRight, Search, Shield, Truck, Repeat, TrendingUp, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product/ProductCard"
import { HeroSearch } from "@/components/search/HeroSearch"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Category data with image URLs (stock images from Unsplash for visual richness)
const categories = [
  { label: "Sneakers",     slug: "sneakers",     emoji: "👟", color: "from-blue-500/20 to-blue-600/10",   imgHint: "sneakers" },
  { label: "Clothing",     slug: "clothing",     emoji: "👕", color: "from-purple-500/20 to-purple-600/10", imgHint: "clothing" },
  { label: "Bags",         slug: "bags",         emoji: "👜", color: "from-amber-500/20 to-amber-600/10",  imgHint: "bags" },
  { label: "Accessories",  slug: "accessories",  emoji: "⌚", color: "from-green-500/20 to-green-600/10",  imgHint: "watches" },
  { label: "Electronics",  slug: "electronics",  emoji: "📱", color: "from-red-500/20 to-red-600/10",     imgHint: "electronics" },
]

function formatCount(n: number): string {
  return n.toLocaleString("en-US") + "+"
}

export default async function Home() {
  const [
    { data: brands },
    { data: newProducts },
    { data: popularProducts },
    { data: platforms },
    { data: blogPosts },
    productCountResult,
    brandCountResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("brands")
      .select("id, name, slug, logo_url, product_count")
      .eq("status", "active")
      .order("product_count", { ascending: false })
      .limit(12),

    supabaseAdmin
      .from("products")
      .select("*, agent_platforms:platform_id(id, name, slug, logo_url)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10),

    supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("click_count", { ascending: false, nullsFirst: false })
      .limit(10),

    supabaseAdmin
      .from("agent_platforms")
      .select("id, name, slug, logo_url, website_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),

    supabaseAdmin
      .from("blog_posts")
      .select("id, title, slug, cover_image, excerpt, published_at")
      .eq("status", "published")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(3),

    supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),

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

  // Merge new + popular, deduplicate by id
  const allProducts = activeProducts
  const popularDeduped = (popularProducts || []).filter(
    (p: any) => !allProducts.find((a) => a.id === p.id)
  ).slice(0, 10)

  return (
    <>
      <SchemaBreadcrumb items={[{ name: "Home", url: "/" }]} />

      <div className="flex flex-col">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#0d1117]">
          {/* Subtle grid texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Glow orb */}
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/3 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-medium text-orange-400">
              <TrendingUp className="size-3" />
              {formatCount(totalProducts)} products from China
            </div>

            <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Discover{" "}
              <span className="text-orange-400">Products</span>{" "}
              from China
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-400 sm:text-lg">
              Search across {formatCount(totalBrands)} brands. Compare prices on{" "}
              {platforms?.length || 5} trusted agents. Get the best deal.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-2xl">
              <HeroSearch
                placeholder="Search sneakers, bags, electronics..."
                action="/products"
                hotKeywords={["Sneakers", "Bags", "Jordan", "Nike", "AirPods"]}
              />
            </div>

            {/* Trust stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Package className="size-4 text-orange-400" />
                <span>{formatCount(totalProducts)} Products</span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-400">
                <TrendingUp className="size-4 text-orange-400" />
                <span>{formatCount(totalBrands)} Brands</span>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <div className="flex items-center gap-2 text-zinc-400">
                <Shield className="size-4 text-orange-400" />
                <span>{platforms?.length || 5} Verified Agents</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PLATFORM TRUST BAR ══════════════════════════════════════════ */}
        {platforms && platforms.length > 0 && (
          <section className="border-y border-zinc-100 bg-zinc-50/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-none">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Shop via
                </span>
                {platforms.map((platform) => (
                  <Link
                    key={platform.id}
                    href={platform.website_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex shrink-0 items-center gap-2 transition-opacity hover:opacity-70"
                  >
                    {platform.logo_url ? (
                      <img
                        src={
                          platform.logo_url.startsWith("http")
                            ? platform.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${platform.logo_url}`
                        }
                        alt={platform.name}
                        className="h-5 object-contain grayscale group-hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-zinc-600">
                        {platform.name}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ FEATURED BRANDS ═══════════════════════════════════════════════ */}
        {brands && brands.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                🔥 Featured Brands
              </h2>
              <Link
                href="/brands"
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                View All <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 lg:grid-cols-8">
              {brands.slice(0, 8).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brand=${brand.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-white p-3 text-center transition-all hover:border-orange-200 hover:shadow-md"
                >
                  {brand.logo_url ? (
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-zinc-50">
                      <img
                        src={
                          brand.logo_url.startsWith("http")
                            ? brand.logo_url
                            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brands/${brand.logo_url}`
                        }
                        alt={brand.name}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-orange-500">
                      {brand.name.charAt(0)}
                    </div>
                  )}
                  <span className="line-clamp-1 text-[11px] font-medium text-zinc-700 group-hover:text-zinc-900">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══ POPULAR CATEGORIES ════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">
              Popular Categories
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
            >
              More <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={`group relative flex h-28 items-end overflow-hidden rounded-xl bg-gradient-to-br ${cat.color} border border-white/60 p-3 transition-all hover:shadow-lg hover:-translate-y-0.5`}
              >
                {/* Big emoji as background art */}
                <span className="absolute -right-2 -top-2 text-6xl opacity-20 transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </span>
                <div className="relative z-10">
                  <span className="text-xl">{cat.emoji}</span>
                  <p className="mt-1 text-sm font-semibold text-zinc-800">
                    {cat.label}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ NEW ARRIVALS ══════════════════════════════════════════════════ */}
        {allProducts.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded bg-orange-500 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
                  New
                </span>
                <h2 className="text-base font-bold text-zinc-900">New Arrivals</h2>
              </div>
              <Link
                href="/products?sort=newest"
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                View All <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} sort="newest" />
              ))}
            </div>
          </section>
        )}

        {/* ══ MOST POPULAR ══════════════════════════════════════════════════ */}
        {popularDeduped.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded bg-red-500 px-2 text-[10px] font-bold uppercase tracking-wide text-white">
                  Hot
                </span>
                <h2 className="text-base font-bold text-zinc-900">Most Popular</h2>
              </div>
              <Link
                href="/products?sort=popular"
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                View All <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {popularDeduped.map((product: any) => (
                <ProductCard key={product.id} product={product} sort="popular" />
              ))}
            </div>
          </section>
        )}

        {/* ══ HOW IT WORKS ══════════════════════════════════════════════════ */}
        <section className="border-t border-zinc-100 bg-zinc-50/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <h2 className="mb-10 text-center text-xl font-bold text-zinc-900 sm:text-2xl">
              How It Works
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Search",
                  desc: "Browse 150K+ products from China's top marketplaces",
                },
                {
                  icon: Repeat,
                  step: "02",
                  title: "Compare",
                  desc: "Compare prices and fees across 5+ trusted agents",
                },
                {
                  icon: Shield,
                  step: "03",
                  title: "Buy Safe",
                  desc: "Choose your agent and buy with quality guarantees",
                },
                {
                  icon: Truck,
                  step: "04",
                  title: "Receive",
                  desc: "Get your items delivered right to your door",
                },
              ].map((step) => (
                <div key={step.title} className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
                      <step.icon className="size-6 text-orange-500" />
                    </div>
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-zinc-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ LATEST BLOG POSTS ════════════════════════════════════════════ */}
        {blogPosts && blogPosts.length > 0 && (
          <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">Latest Articles</h2>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600"
              >
                Read More <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group overflow-hidden rounded-xl border border-zinc-100 bg-white transition-all hover:border-zinc-200 hover:shadow-md"
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
                    <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-orange-600">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">
                        {post.excerpt}
                      </p>
                    )}
                    {post.published_at && (
                      <p className="mt-2 text-[10px] text-zinc-400">
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
          </section>
        )}

        {/* ══ CTA BANNER ════════════════════════════════════════════════════ */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-[#0d1117] px-8 py-14 text-center">
            {/* Orange gradient glow */}
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="relative">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-400">
                Start Discovering
              </p>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                Start Discovering Products Now
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
                Browse our full catalog of {formatCount(totalProducts)} products and
                find the best deals across all trusted agents.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/25"
                  >
                    Browse Products
                    <ArrowRight className="ml-1.5 size-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                  >
                    Become a Promoter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}
