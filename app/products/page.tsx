import type { Metadata } from "next"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Breadcrumb } from "@/components/layout/Breadcrumb"
import { SchemaBreadcrumb } from "@/components/seo/SchemaBreadcrumb"
import { ProductGrid } from "@/components/product/ProductGrid"
import { Pagination } from "@/components/product/Pagination"
import { ProductFilters } from "@/components/product/ProductFilters"

const PER_PAGE = 24
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://findsengine.com"
const USD_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_RATE || "USD_RATE")

export const metadata: Metadata = {
  title: "All Products – Buy from China | Finds Engine",
  description:
    "Browse 150,000+ products from 380+ brands. Filter by category, brand, price. Compare across Kakobuy, CNFans, Fishgoo and more agent platforms.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    brand?: string | string[]
    tag?: string | string[]
    sort?: string
    q?: string
    price_min?: string
    price_max?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams

  // Normalize params
  const category = params.category || ""
  const brands = Array.isArray(params.brand) ? params.brand : params.brand ? [params.brand] : []
  const tags = Array.isArray(params.tag) ? params.tag : params.tag ? [params.tag] : []
  const sort = params.sort || "popular"
  const q = params.q || ""
  const priceMin = params.price_min ? parseFloat(params.price_min) : null
  const priceMax = params.price_max ? parseFloat(params.price_max) : null
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const offset = (page - 1) * PER_PAGE

  // Build product query conditionally
  let productQuery = supabaseAdmin
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .ilike("category", category ? `%${category}%` : "%")
    .ilike("title", q ? `%${q}%` : "%")

  if (brands.length > 0) {
    // brand slug → name for case-insensitive match (e.g. "nike" → "Nike", "new-balance" → "New Balance")
    productQuery = productQuery.ilike("brand", brands[0].replace(/-/g, " "))
  }

  if (priceMin != null) {
    productQuery = productQuery.gte("price_usd", priceMin)
  }

  if (priceMax != null) {
    productQuery = productQuery.lte("price_usd", priceMax)
  }

  // ── Parallel queries ──────────────────────────────────────────────
  const [
    { data: productsData, count: totalCount },
    { data: categoriesData },
    { data: brandsData },
  ] = await Promise.all([
    productQuery.range(offset, offset + PER_PAGE - 1),
    // Categories for filter sidebar
    supabaseAdmin
      .from("categories")
      .select("slug, name, product_count")
      .eq("status", "active")
      .is("parent_id", null)
      .order("sort_order", { ascending: true }),
    // Brands for filter sidebar
    supabaseAdmin
      .from("brands")
      .select("slug, name")
      .eq("status", "active")
      .order("product_count", { ascending: false })
      .limit(30),
  ])

  // ── Handle multiple brands filter ──────────────────────────────────
  let products = productsData ?? []
  if (brands.length > 1) {
    products = products.filter((p) => {
      if (!p.brand) return false
      const productBrandSlug = p.brand.toLowerCase().replace(/\s+/g, "-")
      return brands.some((b) => b === productBrandSlug)
    })
  }

  // ── Handle multiple tags filter ────────────────────────────────────
  if (tags.length > 0) {
    products = products.filter((p) => {
      if (!p.tags || p.tags.length === 0) return false
      return tags.some((tag) =>
        p.tags!.some((t) => t.toLowerCase() === tag.toLowerCase())
      )
    })
  }

  // ── Sort client-side (Supabase free tier has limited sorting) ──────
  const sortedProducts = [...products].sort((a, b) => {
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

  // ── Build active filters list ──────────────────────────────────────
  const activeFilters: { key: string; label: string; value: string }[] = []
  if (category) activeFilters.push({ key: "category", label: `Category: ${category}`, value: category })
  brands.forEach((b) => activeFilters.push({ key: "brand", label: `Brand: ${b}`, value: b }))
  tags.forEach((t) => activeFilters.push({ key: "tag", label: `Tag: ${t}`, value: t }))
  if (q) activeFilters.push({ key: "q", label: `Search: "${q}"`, value: q })
  if (priceMin) activeFilters.push({ key: "price_min", label: `Min: $${priceMin}`, value: String(priceMin) })
  if (priceMax) activeFilters.push({ key: "price_max", label: `Max: $${priceMax}`, value: String(priceMax) })

  // Collect all unique tags from products for the tag filter
  const allTags = new Set<string>()
  products.forEach((p) => p.tags?.forEach((t) => allTags.add(t)))

  // ── Category name for breadcrumb ───────────────────────────────────
  const categoryName = categoriesData?.find((c) => c.slug === category)?.name ?? null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          ...(categoryName ? [{ label: categoryName }] : []),
        ]}
      />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          {categoryName ?? "All Products"}
        </h1>
        {q && (
          <p className="mt-1 text-sm text-zinc-500">
            Search results for &quot;{q}&quot;
          </p>
        )}
      </div>

      {/* JSON-LD Breadcrumb */}
      <SchemaBreadcrumb
        items={[
          { name: "Home", url: `${SITE_URL}` },
          { name: "Products", url: `${SITE_URL}/products` },
          ...(categoryName ? [{ name: categoryName, url: `${SITE_URL}/products?category=${category}` }] : []),
        ]}
      />

      {/* Layout: sidebar + grid */}
      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <ProductFilters
            categories={categoriesData ?? []}
            brands={brandsData ?? []}
            tags={Array.from(allTags)}
            activeFilters={activeFilters}
            sortValue={sort}
            searchQuery={q}
            priceMin={priceMin ? String(priceMin) : ""}
            priceMax={priceMax ? String(priceMax) : ""}
            totalProducts={totalCount ?? 0}
          />
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Mobile filters (top section) */}
          <div className="mb-4 lg:hidden">
            <ProductFilters
              categories={categoriesData ?? []}
              brands={brandsData ?? []}
              tags={Array.from(allTags)}
              activeFilters={activeFilters}
              sortValue={sort}
              searchQuery={q}
              priceMin={priceMin ? String(priceMin) : ""}
              priceMax={priceMax ? String(priceMax) : ""}
              totalProducts={totalCount ?? 0}
            />
          </div>

          {/* Product grid */}
          <ProductGrid
            products={sortedProducts.map((p) => ({
              ...p,
              brand_name: p.brand ?? undefined,
            }))}
            sort={sort}
            emptyMessage={
              q
                ? `No products found for "${q}". Try different keywords.`
                : "No products match your filters."
            }
          />

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/products"
              searchParams={params}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
